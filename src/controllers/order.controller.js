const AsyncHandler = require("express-async-handler");
const { Order } = require("../models");
const { OrderItem } = require("../models");
const { MenuItem } = require("../models");
const responseHandler = require("../utils/responseHandler");
const ApiError = require("../utils/errorHandler");

exports.takeOrder = AsyncHandler(async (req, res, next) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest(
      "Items are required and must be a non-empty array."
    );
  }

  for (const item of items) {
    const menuItem = await MenuItem.findByPk(item.menuItemId);
    if (!menuItem) {
      throw ApiError.notFound(`Menu item with ID ${item.menuItemId} not found`);
    }
  }

  const order = await Order.create(
    {
      userId,
    },
    { include: [{ model: OrderItem, as: "orderItems" }] }
  );

  for (const item of items) {
    const menuItem = await MenuItem.findByPk(item.menuItemId);

    await OrderItem.create({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      totalPrice: menuItem.price * item.quantity,
    });
  }

  const total = await OrderItem.sum("totalPrice", {
    where: { orderId: order.id },
  });
  await order.update({ total });

  return responseHandler(res, order, "Order created successfully", 201);
});
exports.addOrderItem = AsyncHandler(async (req, res, next) => {
  const { menuItemId, quantity } = req.body;
  const orderId = req.params.id;

  const order = await Order.findByPk(orderId);

  if (!order) {
    throw ApiError.notFound(`Order with this ID not found`);
  }
  if (order.status !== "pending") {
    throw ApiError.badRequest("Cannot modify a completed order");
  }

  const menuItem = await MenuItem.findByPk(menuItemId);

  if (!menuItem) {
    throw ApiError.notFound(`Menu item with this ID not found`);
  }

  const existingOrderItem = await OrderItem.findOne({
    where: { orderId, menuItemId },
  });

  let orderItem;

  if (existingOrderItem) {
    existingOrderItem.quantity += quantity;
    existingOrderItem.totalPrice = existingOrderItem.quantity * menuItem.price;
    await existingOrderItem.save();

    orderItem = existingOrderItem;
  } else {
    orderItem = await OrderItem.create({
      orderId,
      menuItemId,
      quantity,
      totalPrice: menuItem.price * quantity,
    });
  }

  const total = await OrderItem.sum("totalPrice", { where: { orderId } });
  await Order.update({ total }, { where: { id: orderId } });

  return responseHandler(
    res,
    orderItem,
    "Order item added/updated successfully",
    201
  );
});
exports.removeOrderItem = AsyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const { menuItemId } = req.body;
  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: "orderItems" }],
  });

  if (!order) {
    throw ApiError.notFound("Order not found");
  }
  if (order.status !== "pending") {
    throw ApiError.badRequest("Cannot modify a completed order");
  }

  const orderItem = await OrderItem.findOne({
    where: { orderId, menuItemId },
  });

  if (!orderItem) {
    throw ApiError.notFound("Order item not found");
  }

  await orderItem.destroy();

  const total = await OrderItem.sum("totalPrice", { where: { orderId } });
  await order.update({ total });

  return responseHandler(res, null, "Order item removed successfully", 200);
});
exports.completeOrder = AsyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (order.status === "completed" || order.status === "expired") {
    throw ApiError.badRequest("Order is already completed or expired");
  }

  await order.update({ status: "complete" });

  return responseHandler(res, null, "Order completed successfully", 200);
});
exports.getAllOrders = AsyncHandler(async (req, res, next) => {
  const orders = await Order.findAll({
    include: [
      {
        model: OrderItem,
        as: "orderItems",
      },
    ],
  });

  return responseHandler(res, orders, "Orders fetched successfully", 200);
});
exports.getOrderDetails = AsyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      {
        model: OrderItem,
        as: "orderItems",
        include: [
          {
            model: MenuItem,
            as: "menuItem",
          },
        ],
      },
    ],
  });

  if (!order) {
   throw  ApiError.notFound("No order found with that ID")
  }

  return responseHandler(res, order, "Order fetched successfully", 200);
});
