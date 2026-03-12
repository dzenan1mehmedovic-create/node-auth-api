const ApiError = require("../utils/api-error");
const ApiResponse = require("../utils/api-response");
const asyncHandler = require("../utils/async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { hashPassword, comparePassword } = require("../utils/hash");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generate-tokens");

const { findUserByEmail, createUser } = require("../services/auth.service");
const { getDB } = require("../config/db");

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const db = getDB();

  await db.execute("UPDATE users SET refresh_token = ? WHERE id = ?", [
    refreshToken,
    user.id,
  ]);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    accessToken,
    refreshToken,
  });
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
const logoutUser = asyncHandler(async (req, res) => {
  const db = getDB();

  await db.execute("UPDATE users SET refresh_token = NULL WHERE id = ?", [
    req.user.id,
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const db = getDB();

  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
    decoded.id,
  ]);

  const user = rows[0];

  if (!user || user.refresh_token !== refreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const newAccessToken = generateAccessToken(user);

  return res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
});
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const db = getDB();

  await db.execute(
    "UPDATE users SET reset_password_token = ?, reset_password_expire = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?",
    [resetTokenHash, user.id]
  );

  return res.status(200).json({
    success: true,
    message: "Password reset token generated",
    resetToken,
  });
});
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const db = getDB();

  const [rows] = await db.execute(
    "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expire > NOW()",
    [hashedToken]
  );

  const user = rows[0];

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const hashedPassword = await hashPassword(newPassword);

  await db.execute(
    "UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?",
    [hashedPassword, user.id]
  );

  return res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};
