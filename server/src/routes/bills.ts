import { Router } from "express";
import { z } from "zod";
import { Bill } from "../models/Bill.js";
import { Company } from "../models/Company.js";
import { authenticate, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { notificationService } from "../services/notifications/index.js";
import { sendPaymentConfirmation } from "../services/notifications/payment-confirmation.js";
import type { Types } from "mongoose";

const router = Router();

const billSchema = z.object({
  companyId: z.string().min(1),
  invoiceNumber: z.string().min(1).trim(),
  totalAmount: z.number().positive(),
  billDate: z.string().min(1),
});

const completeBillSchema = z.object({
  paymentMethod: z.enum(["CASH", "CHEQUE", "ONLINE"]),
  paidAmount: z.number().positive().optional(),
  paymentDate: z.string().optional(),
  discount: z.number().min(0).optional(),
});

// GET /api/bills
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, companyId } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (companyId) filter.companyId = companyId;

    const bills = await Bill.find(filter)
      .populate("companyId", "name phone")
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/bills/stats
router.get("/stats", authenticate, async (_req, res) => {
  try {
    const [totalBills, pendingBills, completedBills, overdueBills] = await Promise.all([
      Bill.countDocuments(),
      Bill.countDocuments({ status: "PENDING" }),
      Bill.countDocuments({ status: "COMPLETED" }),
      Bill.countDocuments({ status: "OVERDUE" }),
    ]);

    const [totalAmount, pendingAmount, completedAmount] = await Promise.all([
      Bill.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Bill.aggregate([
        { $match: { status: { $in: ["PENDING", "OVERDUE"] } } },
        { $group: { _id: null, total: { $sum: { $subtract: ["$totalAmount", "$paidAmount"] } } } },
      ]),
      Bill.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
      totalBills,
      pendingBills: pendingBills + overdueBills,
      completedBills,
      overdueBills,
      totalAmount: totalAmount[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
      completedAmount: completedAmount[0]?.total || 0,
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/bills/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("companyId", "name phone");
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    res.json(bill);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/bills
router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = billSchema.parse(req.body);

    // Verify company exists
    const company = await Company.findById(data.companyId);
    if (!company) {
      res.status(400).json({ error: "Company not found" });
      return;
    }

    const bill = await Bill.create({
      ...data,
      billDate: new Date(data.billDate),
      status: "PENDING",
      paidAmount: 0,
    });

    res.status(201).json(bill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/bills/:id
router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = billSchema.parse(req.body);

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    if (bill.status === "COMPLETED") {
      res.status(400).json({ error: "Cannot edit a completed bill" });
      return;
    }

    const updated = await Bill.findByIdAndUpdate(
      req.params.id,
      { ...data, billDate: new Date(data.billDate) },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/bills/:id/complete
router.patch("/:id/complete", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { paymentMethod, paidAmount, paymentDate, discount } = completeBillSchema.parse(req.body);

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    if (bill.status === "COMPLETED") {
      res.status(400).json({ error: "Bill is already completed" });
      return;
    }

    // Apply discount if provided
    const discountAmount = discount ?? 0;
    const effectiveTotal = bill.totalAmount - (bill.discount || 0) - discountAmount + (bill.discount || 0);
    // Update discount on the bill
    const newDiscount = (bill.discount || 0) + discountAmount;

    // Calculate payment
    const alreadyPaid = bill.paidAmount || 0;
    const billEffectiveTotal = bill.totalAmount - newDiscount;
    const payment = paidAmount ?? (billEffectiveTotal - alreadyPaid);
    const nextPaid = Math.min(billEffectiveTotal, alreadyPaid + payment);
    const settled = nextPaid >= billEffectiveTotal;

    // Add payment entry to history
    const paidAt = paymentDate ? new Date(paymentDate) : new Date();
    const paymentEntry = {
      amount: payment,
      method: paymentMethod,
      paidAt,
    };

    const updated = await Bill.findByIdAndUpdate(
      req.params.id,
      {
        paidAmount: nextPaid,
        discount: newDiscount,
        paymentMethod,
        $push: { payments: paymentEntry },
        ...(settled
          ? { status: "COMPLETED", completedAt: new Date() }
          : {}),
      },
      { new: true }
    );

    // Send payment confirmation notification to the company
    const company = await Company.findById(bill.companyId);
    if (company && updated) {
      // Fire-and-forget: don't block the API response
      sendPaymentConfirmation({
        billId: bill._id as Types.ObjectId,
        companyId: company._id as Types.ObjectId,
        companyName: company.name,
        phone: company.phone,
        invoiceNumber: bill.invoiceNumber,
        totalAmount: bill.totalAmount,
        paidAmount: nextPaid,
        paymentMethod,
        isFullyPaid: settled,
      }).catch((err) => {
        console.error("Failed to send payment confirmation:", err);
      });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/bills/:id/payments/:paymentId
router.delete("/:id/payments/:paymentId", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const payment = bill.payments.find(
      (p) => p._id?.toString() === req.params.paymentId
    );
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    // Remove the payment and recalculate paidAmount
    const newPaidAmount = Math.max(0, bill.paidAmount - payment.amount);
    const remainingPayments = bill.payments.length - 1;

    const updateData: Record<string, unknown> = {
      paidAmount: newPaidAmount,
      $pull: { payments: { _id: req.params.paymentId } },
    };

    // If no payments remain, clear the paymentMethod
    if (remainingPayments <= 0) {
      updateData.paymentMethod = null;
    }

    // If bill was completed but now has remaining balance, revert to pending
    if (bill.status === "COMPLETED" && newPaidAmount < bill.totalAmount) {
      updateData.status = "PENDING";
      updateData.completedAt = null;
    }

    const updated = await Bill.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/bills/:id
router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    res.json({ message: "Bill deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
