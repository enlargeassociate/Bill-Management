import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(1).trim(),
  username: z.string().min(1).trim(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "VIEWER"]).optional(),
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, role } = registerSchema.parse(req.body);

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || "VIEWER",
    });

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req: AuthRequest, res) => {
  const user = req.user!;
  res.json({
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
  });
});

export default router;
