const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth.controller");
const { signupValidator, loginValidator, requestPasswordResetValidator, resetPasswordValidator } = require("../validations/auth.vc");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  message: "Too many requests, please try again later.",
});
router.post("/signup", signupValidator, signup);
router.post("/login", limiter, loginValidator, login);
router.post("/request-password-reset", requestPasswordResetValidator, requestPasswordReset);
router.post("/reset-password/:token", resetPasswordValidator, resetPassword);

module.exports = router;
