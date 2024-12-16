const jwt = require("jsonwebtoken");
const AsyncHandler = require("express-async-handler");
const ApiError = require("../utils/errorHandler");
const { JWT_SECRET } = require("../utils/env");
const { User } = require("../models");
const { json } = require("body-parser");

exports.protectRoute = (roles = []) =>
  AsyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw new ApiError("No token provided", 401);
    }
    let token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.message === "jwt expired") {
          throw new ApiError("Token expired", 401);
        }
        throw new ApiError("Invalid token", 401);
      }
      return decoded;
    });
    const existingUser = await User.findByPk(decoded.id);

    if (!existingUser) {
      throw new ApiError("User not found", 404);
    }

    req.user = existingUser;

    if (roles.length && !roles.includes(req.user.role)) {
      throw new ApiError(
        "You do not have permission to access this resource",
        403
      );
    }

    next();
  });
