const { MenuItem } = require("../models");
const {
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./factory.controller");
const AsyncHandler = require("express-async-handler");
const responseHandler = require("../utils/responseHandler");
const ApiError = require("../utils/errorHandler");
const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const { createExcelFile } = require("../utils/excel");
const {OrderItem} = require("../models");

exports.getAllMenueItems = AsyncHandler(async (req, res, next) => {
  const {
    category,
    sort = "price",
    order = "ASC",
    limit = 10,
    page = 1,
  } = req.query;
  if (!["ASC", "DESC"].includes(order.toUpperCase())) {
    throw ApiError.badRequest("Order must be either ASC or DESC");
  }
  if (sort !== "price") {
    throw ApiError.badRequest("Not allowed to sort by this field");
  }

  const offset = (page - 1) * limit;

  const queryOptions = {
    where: {},
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };

  if (category) {
    queryOptions.where.category = category;
  }
  const menuItems = await MenuItem.findAndCountAll(queryOptions);

  if (menuItems.count === 0) {
    throw ApiError.notFound("No menu items found");
  }

  const totalPages = Math.ceil(menuItems.count / limit);
  return responseHandler(
    res,
    menuItems.rows,
    "Documents fetched successfully",
    200,
    {
      totalPages,
      totalItems: menuItems.count,
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }
  );
});

exports.getByIdMenueItem = getOne(MenuItem);

exports.createMenueItem = createOne(MenuItem);

exports.updateMenueItem = updateOne(MenuItem);

exports.deleteMenueItem = deleteOne(MenuItem);
exports.exportTopSellingItems = AsyncHandler(async (req, res, next) => {
  const endDate = moment().endOf("day");
  const startDate = moment().subtract(30, "days").startOf("day");

  
  const orderItems = await OrderItem.findAll({
    attributes: [
      "menuItemId",
      [Sequelize.fn("sum", Sequelize.col("quantity")), "totalQuantity"],
    ],
    where: {
      createdAt: {
        [Op.between]: [startDate.toDate(), endDate.toDate()],
      },
    },
    group: ["menuItemId"],
    order: [[Sequelize.fn("sum", Sequelize.col("quantity")), "DESC"]],
    limit: 10,
    include: [
      {
        model: MenuItem,
        as: "menuItem",
        attributes: ["id", "name", "price"],
      },
    ],
    raw: true,
  });

  if (orderItems.length === 0) {
    throw ApiError.notFound("No items sold in the last 30 days.");
  }

  columns = [
    { header: "Menu Item", key: "itemName", width: 30 },
    { header: "Total Quantity Sold", key: "totalQuantity", width: 20 },
    { header: "Price", key: "price", width: 15 },
    { header: "Total Sales", key: "totalSales", width: 20 },
  ];

  const data = orderItems.map((orderItem) => {
    const totalQuantity = parseInt(orderItem.totalQuantity, 10);
    const price = orderItem["menuItem.price"];
    const totalSales = totalQuantity * price;

    return {
      itemName: orderItem["menuItem.name"],
      totalQuantity,
      price,
      totalSales,
    };
  });

  await createExcelFile(res, "TopSellingItems", columns, data);
});