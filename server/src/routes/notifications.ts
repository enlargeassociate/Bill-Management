import { Router } from "express";
import { NotificationLog } from "../models/NotificationLog.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications — List notification history
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { billId, companyId, status, limit = "50", page = "1" } = req.query;

    const filter: Record<string, unknown> = {};
    if (billId) filter.billId = billId;
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      NotificationLog.find(filter)
        .populate("companyId", "name")
        .populate("billId", "invoiceNumber")
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      NotificationLog.countDocuments(filter),
    ]);

    res.json({
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/notifications/stats — Notification summary
router.get("/stats", authenticate, async (_req, res) => {
  try {
    const [totalSent, totalFailed, last24h] = await Promise.all([
      NotificationLog.countDocuments({ status: "sent" }),
      NotificationLog.countDocuments({ status: "failed" }),
      NotificationLog.countDocuments({
        sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({ totalSent, totalFailed, last24h });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
