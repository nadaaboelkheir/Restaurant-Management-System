const express = require("express");
const router = express.Router();
const {
  takeOrder,
  addOrderItem,
  removeOrderItem,
  completeOrder,
  getOrderDetails,
  getAllOrders,
  exportOrdersInExcel,
} = require("../controllers/order.controller");
const {
  takeOrderValidator,
  addOrderItemValidator,
  removeOrderItemValidator,
  completeOrderValidator,
  getOrderDetailsValidator,
} = require("../validations/order.vc");
const { protectRoute } = require("../middlewares/auth.mw");

// Note : remove auth middleware in exportOrdersInExcel for testing it in web browser
router.get("/export", exportOrdersInExcel);
router.get("/", protectRoute(["admin"]), getAllOrders);
router.post("/", protectRoute(["staff"]), takeOrderValidator, takeOrder);
router.post(
  "/:id",
  protectRoute(["staff"]),
  addOrderItemValidator,
  addOrderItem
);
router.delete(
  "/:id",
  protectRoute(["staff"]),
  removeOrderItemValidator,
  removeOrderItem
);
router.put(
  "/:id",
  protectRoute(["staff"]),
  completeOrderValidator,
  completeOrder
);
router.get(
  "/:id",
  protectRoute(["admin", "staff"]),
  getOrderDetailsValidator,
  getOrderDetails
);

module.exports = router;
