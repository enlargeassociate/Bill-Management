import { Router } from "express";
import { z } from "zod";
import { Company } from "../models/Company.js";
import { Bill } from "../models/Bill.js";
import { authenticate, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const companySchema = z.object({
  name: z.string().min(1).trim(),
  phone: z.string().min(10).trim(),
});

// GET /api/companies
router.get("/", authenticate, async (_req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/companies/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/companies
router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = companySchema.parse(req.body);
    const company = await Company.create(data);
    res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/companies/:id
router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = companySchema.parse(req.body);
    const company = await Company.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/companies/:id
router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Check if company has bills
    const billCount = await Bill.countDocuments({ companyId: req.params.id });
    if (billCount > 0) {
      res.status(400).json({ error: `Cannot delete company with ${billCount} bill(s). Delete bills first.` });
      return;
    }

    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json({ message: "Company deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
