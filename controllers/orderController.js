const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const { checkPermissions } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const fakeStripeApi = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";

  return { amount, client_secret };
};
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).json({ orders });
};
const getSingleOrder = async (req, res) => {
  const {
    params: { id: orderId },
    user,
  } = req;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.BadRequestError(`No order with id : ${orderId}`);
  }
  checkPermissions(user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  if (!orders || orders.length < 1) {
    throw new CustomError.BadRequestError("No orders provided");
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const createOrder = async (req, res) => {
  const { shippingFee, tax, items: cartItems } = req.body;
  if (!shippingFee || !tax) {
    throw new CustomError.BadRequestError(
      "Please provide shipping Fee and tax"
    );
  }
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided");
  }
  let subTotal = 0;
  let orderItems = [];
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.BadRequestError(
        `No product with id : ${item.product}`
      );
    }
    const { name, image, price, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      image,
      price,
      product: _id,
    };
    subTotal += price * item.amount;
    orderItems = [...orderItems, singleOrderItem];
  }
  const total = shippingFee + tax + subTotal;
  const paymentIntent = await fakeStripeApi({ amount: total, currency: "usd" });
  const order = await Order.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
const updateOrder = async (req, res) => {
  const {
    params: { id: orderId },
    body: { paymentIntentId },
  } = req;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.BadRequestError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  createOrder,
  updateOrder,
};
