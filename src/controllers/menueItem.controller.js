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
