const cron = require("node-cron");
const AsyncHandler = require("express-async-handler");
const { Order } = require("../models");
const { Op } = require("sequelize");

const checkExpirationOrders = AsyncHandler(async () => {
  const ordersToExpire = await Order.findAll({
    where: {
      status: "pending",
      expiredAt: {
        [Op.lt]: new Date(), 
      },
    },
  });

  if (ordersToExpire.length === 0) {
    console.log("No orders to expire");
    return;
  }

  for (const order of ordersToExpire) {
    await order.update({
      status: "expired",
    });
    console.log(`Order ${order.id} expired due to timeout`);
  }
});

cron.schedule("* * * * *", checkExpirationOrders);
