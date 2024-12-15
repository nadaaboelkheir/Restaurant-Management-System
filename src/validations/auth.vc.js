const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validations.mw");

exports.signupValidator = [
  check("username")
    .exists()
    .withMessage("no firstName field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("firstName is required"),
  check("email")
    .exists()
    .withMessage("no email field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .exists()
    .withMessage("no password field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("password required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .exists()
    .withMessage("no email field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .exists()
    .withMessage("no password field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("password required"),
  validatorMiddleware,
];
