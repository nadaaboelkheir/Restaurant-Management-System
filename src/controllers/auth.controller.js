const AsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const responseHandler = require("../utils/responseHandler");
const ApiError = require("../utils/errorHandler");
const { generateToken } = require("../utils/functions");


exports.createAdminIfNotExist = AsyncHandler(async (req, res, next) => {
  const admin = await User.findOne({ where: { role: "admin" } });
  if (!admin) {
    await User.create({
      username: "admin",
      email: "admin@gmail.com",
      password: "admin",
      role: "admin",
      verified: true
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
   throw ApiError.notFound("User not found")
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
   throw ApiError.unauthorized("Invalid credentials")
  }

  const token = generateToken(user);

  return responseHandler(
    res,
    { user, token },
    "User logged in successfully",
    200
  );
});
