const AsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const responseHandler = require("../utils/responseHandler");
const ApiError = require("../utils/errorHandler");
const { generateToken } = require("../utils/functions");
const crypto = require("crypto");
const moment = require("moment");
const { sendEmail } = require("../utils/sendMails");
const { Op } = require("sequelize");

exports.createAdminIfNotExist = AsyncHandler(async (req, res, next) => {
  const admin = await User.findOne({ where: { role: "admin" } });
  if (!admin) {
    await User.create({
      username: "admin",
      email: "admin@gmail.com",
      password: "admin",
      role: "admin",
      verified: true,
    });
    console.log("Admin created successfully");
  } else {
    console.log("Admin already exists");
  }
});

exports.signup = AsyncHandler(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  const user = await User.findOne({ where: { email: email } });

  if (user) {
    return next(new ApiError("User already exists", 400));
  }

  if (password !== confirmPassword) {
    return next(new ApiError("Passwords do not match", 400));
  }
  const newUser = await User.create({
    username,
    email,
    password,
    role: "staff",
  });

  const token = generateToken(newUser);
  return responseHandler(
    res,
    { user: newUser, token },
    "User registered successfully",
    201
  );
});

exports.login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const token = generateToken(user);

  return responseHandler(
    res,
    { user, token },
    "User logged in successfully",
    200
  );
});

const sendPasswordResetEmail = async (user) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = moment().add(1, "hour").toISOString();

  await user.update({ resetToken, resetTokenExpiry });

  const resetLink = `http://localhost:8080/auth/reset-password?token=${resetToken}`;

  const htmlContent = `
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
  `;

  // Send the password reset email
  await sendEmail(
    user.email,
    "Password Reset Request",
    "You requested a password reset.",
    htmlContent
  );
};

exports.requestPasswordReset = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  await sendPasswordResetEmail(user);

  return responseHandler(
    res,
    null,
    "Password reset email sent successfully",
    200
  );
});
exports.resetPassword = AsyncHandler(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.params;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest("Passwords do not match");
  }

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiry: { [Op.gt]: moment().toISOString() },
    },
  });

  if (!user) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  await user.update({
    password: newPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return responseHandler(res, null, "Password reset successfully", 200);
});
