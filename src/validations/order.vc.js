const { check, param, query } = require("express-validator");
const validatorMiddleware = require("../middlewares/validations.mw");

// Generic validator factory
const validateField = (source, field, type) => {
  const validator = source(field)
    .exists()
    .withMessage(`No ${field} field exists in the request data`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`);

  if (type === "uuid") {
    return validator.isUUID().withMessage(`${field} must be a UUID`);
  } else if (type === "int") {
    return validator.isInt().withMessage(`${field} must be an integer`);
  }

  return validator; 
};

const validateUUID = (source, field) => validateField(source, field, "uuid");
const validateInt = (source, field) => validateField(source, field, "int");

exports.takeOrderValidator = [
  validateField(check, "items")
    .isArray()
    .withMessage("Items must be an array"),
  validatorMiddleware,
];

exports.addOrderItemValidator = [
  validateUUID(check, "orderId"),
  validateUUID(check, "menuItemId"),
  validateInt(check, "quantity"),
  validatorMiddleware,
];

exports.removeOrderItemValidator = [
  validateUUID(param, "orderId"),
  validateUUID(param, "menuItemId"),
  validatorMiddleware,
];

exports.completeOrderValidator = [
  validateUUID(param, "orderId"),
  validatorMiddleware,
];

exports.getOrderDetailsValidator = [
  validateUUID(param, "orderId"),
  validatorMiddleware,
];
