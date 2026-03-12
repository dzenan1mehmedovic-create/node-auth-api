const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const { validateRegisterBody } = require("../validators/auth.validator");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", validateRegisterBody, registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
