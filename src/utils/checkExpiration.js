const cron = require("node-cron");
const AsyncHandler = require("express-async-handler");
const { Order } = require("../models");
const { Op } = require("sequelize");

const checkExpirationOrders = AsyncHandler(async () => {
  const ordersToExpire = await Order.findAll({
    where: {
      status: "pending",
      createdAt: {
        [Op.lt]: new Date(new Date() - 4 * 60 * 60 * 1000),
      },
    },
  });

  for (const order of ordersToExpire) {
    await order.update({
      status: "expired",
      expiredAt: new Date(),
    });
    console.log(`Order ${order.id} expired due to timeout`);
  }
});

cron.schedule("* * * * *", checkExpirationOrders);
