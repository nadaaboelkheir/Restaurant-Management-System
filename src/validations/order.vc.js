const { check, param } = require("express-validator");
const validatorMiddleware = require("../middlewares/validations.mw");

const isUUID = (fieldName) =>
  param(fieldName).isUUID().withMessage(`${fieldName} must be a UUID`);
const isRequiredField = (fieldName) =>
  check(fieldName)
    .exists()
    .withMessage(`No ${fieldName} field exists in the request data`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`);

const isIntegerField = (fieldName) =>
  check(fieldName)
    .exists()
    .withMessage(`No ${fieldName} field exists in the request data`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .bail()
    .isInt()
    .withMessage(`${fieldName} must be an integer`);

const isArrayField = (fieldName) =>
  check(fieldName)
    .exists()
    .withMessage(`No ${fieldName} field exists in the request data`)
    .bail()
    .isArray()
    .withMessage(`${fieldName} must be an array`);

exports.takeOrderValidator = [isArrayField("items"), validatorMiddleware];

exports.addOrderItemValidator = [
  isUUID("id"),
  isRequiredField("menuItemId")
    .bail()
    .isUUID()
    .withMessage("menuItemId must be a UUID"),
  isIntegerField("quantity"),
  validatorMiddleware,
];

exports.removeOrderItemValidator = [
  isUUID("id"),
  isRequiredField("menuItemId")
    .bail()
    .isUUID()
    .withMessage("menuItemId must be a UUID"),
  validatorMiddleware,
];

exports.completeOrderValidator = [isUUID("id"), validatorMiddleware];

exports.getOrderDetailsValidator = [isUUID("id"), validatorMiddleware];
