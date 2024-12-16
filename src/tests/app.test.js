const { signup } = require("../controllers/auth.controller");
const { User, Order, OrderItem, MenuItem } = require("../models");
const {
  removeOrderItem,
  addOrderItem,
  takeOrder,
} = require("../controllers/order.controller");
const responseHandler = require("../utils/responseHandler");
const { generateToken } = require("../utils/functions");
const ApiError = require("../utils/errorHandler");

jest.mock("../utils/responseHandler", () => jest.fn());
jest.mock("../utils/functions");
jest.mock("../models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Order: {
    findByPk: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  OrderItem: {
    findOne: jest.fn(),
    destroy: jest.fn(),
    sum: jest.fn(),
    create: jest.fn(),
  },
  MenuItem: {
    findByPk: jest.fn(),
  },
}));

describe("removeOrderItem", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: "1" },
      body: { menuItemId: 2 },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("should return an error if order is not found", async () => {
    Order.findByPk.mockResolvedValue(null);

    await removeOrderItem(req, res, next);

    expect(next).toHaveBeenCalledWith(ApiError.notFound("Order not found"));
  });

  test("should return an error if order is not in 'pending' status", async () => {
    Order.findByPk.mockResolvedValue({ status: "completed", orderItems: [] });

    await removeOrderItem(req, res, next);

    expect(next).toHaveBeenCalledWith(
      ApiError.badRequest("Cannot modify a completed order")
    );
  });

  test("should return an error if order item is not found", async () => {
    Order.findByPk.mockResolvedValue({
      status: "pending",
      orderItems: [],
    });

    OrderItem.findOne.mockResolvedValue(null);

    await removeOrderItem(req, res, next);

    expect(next).toHaveBeenCalledWith(
      ApiError.notFound("Order item not found")
    );
  });

  test("should successfully remove order item and update total", async () => {
    const mockOrder = {
      status: "pending",
      orderItems: [{ id: 1, totalPrice: 10 }],
      update: jest.fn(),
    };

    const mockOrderItem = {
      id: 1,
      destroy: jest.fn(),
    };

    Order.findByPk.mockResolvedValue(mockOrder);
    OrderItem.findOne.mockResolvedValue(mockOrderItem);
    OrderItem.sum.mockResolvedValue(10);

    const req = {
      params: { id: 1 },
      body: { menuItemId: 1 },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await removeOrderItem(req, res, next);

    expect(OrderItem.findOne).toHaveBeenCalledWith({
      where: { orderId: req.params.id, menuItemId: req.body.menuItemId },
    });
    expect(mockOrderItem.destroy).toHaveBeenCalledTimes(1);
    expect(OrderItem.sum).toHaveBeenCalledWith("totalPrice", {
      where: { orderId: req.params.id },
    });
    expect(mockOrder.update).toHaveBeenCalledWith({ total: 10 });

    expect(responseHandler).toHaveBeenCalledWith(
      res,
      null,
      "Order item removed successfully",
      200
    );
  });
});
describe("Signup Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("should register a new user and return a token", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    });
    generateToken.mockReturnValue("mock-token");

    await signup(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: req.body.email },
    });
    expect(User.create).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "staff",
    });
    expect(generateToken).toHaveBeenCalledWith({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    });
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      {
        user: { id: 1, username: "testuser", email: "test@example.com" },
        token: "mock-token",
      },
      "User registered successfully",
      201
    );
  });

  test("should return an error if user already exists", async () => {
    User.findOne.mockResolvedValue({ id: 1, email: "test@example.com" });

    await signup(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: req.body.email },
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User already exists",
        statusCode: 400,
      })
    );
  });

  test("should return an error if passwords do not match", async () => {
    User.findOne.mockResolvedValue(null);

    req.body.confirmPassword = "wrongpassword";

    await signup(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Passwords do not match",
        statusCode: 400,
      })
    );
  });
});

describe("addOrderItem", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: "1" },
      body: { menuItemId: "101", quantity: 2 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should add a new order item and update the order total", async () => {
    const mockOrder = { id: "1", status: "pending", save: jest.fn() };
    const mockMenuItem = { id: "101", price: 10 };
    const mockOrderItem = {
      id: "201",
      quantity: 2,
      totalPrice: 20,
      save: jest.fn(),
    };

    Order.findByPk.mockResolvedValue(mockOrder);
    MenuItem.findByPk.mockResolvedValue(mockMenuItem);
    OrderItem.findOne.mockResolvedValue(null);
    OrderItem.create.mockResolvedValue(mockOrderItem);
    OrderItem.sum.mockResolvedValue(20);
    Order.update.mockResolvedValue();

    responseHandler.mockImplementation((res, data, message, status) => {
      res.status(status).json({ data, message });
    });

    await addOrderItem(req, res, next);

    expect(Order.findByPk).toHaveBeenCalledWith("1");
    expect(MenuItem.findByPk).toHaveBeenCalledWith("101");
    expect(OrderItem.create).toHaveBeenCalledWith({
      orderId: "1",
      menuItemId: "101",
      quantity: 2,
      totalPrice: 20,
    });
    expect(OrderItem.sum).toHaveBeenCalledWith("totalPrice", {
      where: { orderId: "1" },
    });
    expect(Order.update).toHaveBeenCalledWith(
      { total: 20 },
      { where: { id: "1" } }
    );
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      mockOrderItem,
      "Order item added/updated successfully",
      201
    );
  });

  test("should throw an error if the order is not found", async () => {
    Order.findByPk.mockResolvedValue(null);

    await addOrderItem(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Order with this ID not found",
      })
    );
  });
});

describe("takeOrder", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { items: [] },
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should throw an error if items are missing or invalid", async () => {
    req.body.items = null;

    await takeOrder(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toBe(
      "Items are required and must be a non-empty array."
    );
  });

  test("should throw an error if a menu item does not exist", async () => {
    req.body.items = [{ menuItemId: 1, quantity: 2 }];
    MenuItem.findByPk.mockResolvedValue(null);

    await takeOrder(req, res, next);

    expect(MenuItem.findByPk).toHaveBeenCalledWith(1);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toBe("Menu item with ID 1 not found");
  });

  test("should create an order and order items correctly", async () => {
    req.body.items = [{ menuItemId: 101, quantity: 2 }];
    req.user = { id: 1 };

    const mockMenuItem = { id: 101, price: 10 };
    MenuItem.findByPk.mockResolvedValue(mockMenuItem);

    const mockOrder = { id: 1, update: jest.fn() };
    Order.create.mockResolvedValue(mockOrder);

    OrderItem.create.mockResolvedValue({});

    OrderItem.sum.mockResolvedValue(20);

    await takeOrder(req, res, next);

    expect(Order.create).toHaveBeenCalledWith(
      { userId: req.user.id },
      { include: [{ model: OrderItem, as: "orderItems" }] }
    );

    // Ensure that OrderItem.create is called for each item in the array
    // expect(OrderItem.create).toHaveBeenCalledTimes(req.body.items.length);
    expect(OrderItem.create).toHaveBeenCalledWith({
      orderId: mockOrder.id,
      menuItemId: 101,
      quantity: 2,
      totalPrice: 20,
    });

    expect(mockOrder.update).toHaveBeenCalledWith({ total: 20 });

    expect(responseHandler).toHaveBeenCalledWith(
      res,
      mockOrder,
      "Order created successfully",
      201
    );
  });
});
