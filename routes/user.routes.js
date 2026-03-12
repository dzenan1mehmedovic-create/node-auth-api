import express from "express";
import jwt from "jsonwebtoken";
import { updateUserRequestBodySchema } from "../validation/request.validation.js";

import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/request.validation.js";

import {
  createUser,
  findUserByEmail,
  validateUserPassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
} from "../services/user.service.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const result = signupPostRequestBodySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { username, email, password } = result.data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      error: `User with email ${email} already exists`,
    });
  }

  const user = await createUser({ username, email, password });

  return res.status(201).json({
    data: { userId: user.id },
  });
});

router.post("/login", async (req, res) => {
  const result = loginPostRequestBodySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { email, password } = result.data;

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = validateUserPassword(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return res.json({
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    data: { user: req.user },
  });
});

router.get("/", authenticateToken, async (req, res) => {
  const users = await getAllUsers();

  res.json({
    data: { users },
  });
});

router.get("/:id", authenticateToken, async (req, res) => {
  const user = await getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    data: { user },
  });
});

router.put("/:id", authenticateToken, async (req, res) => {
  const validation = updateUserRequestBodySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid data",
    });
  }

  const user = await getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  const updatedUser = await updateUserById(req.params.id, validation.data);

  res.json({
    data: {
      user: updatedUser,
    },
  });
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const deleted = await deleteUserById(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    data: { message: "User deleted" },
  });
});

export default router;
