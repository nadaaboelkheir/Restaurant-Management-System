const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.controller");
const {signupValidator, loginValidator} = require("../validations/auth.vc");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests, please try again later.",
});
router.post("/signup",signupValidator, signup);
router.post("/login",limiter, loginValidator, login);

module.exports = router;
