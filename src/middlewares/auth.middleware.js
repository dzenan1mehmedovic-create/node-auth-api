const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/api-error");
const { getDB } = require("../config/db");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized request");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Access token is missing");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const db = getDB();

  const [rows] = await db.execute(
    "SELECT id, username, email, is_email_verified, created_at FROM users WHERE id = ?",
    [decodedToken.id]
  );

  const user = rows[0];

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  req.user = user;
  next();
});

module.exports = {
  verifyJWT,
};
