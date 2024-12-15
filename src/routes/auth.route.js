const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.controller");
const {signupValidator, loginValidator} = require("../validations/auth.vc");

router.post("/signup",signupValidator, signup);
router.post("/login", loginValidator, login);

module.exports = router;
