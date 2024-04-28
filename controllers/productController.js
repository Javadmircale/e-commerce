const Product = require("../models/ProductModel");
const { StatusCodes } = require("http-status-codes");
const path = require("path");
const CustomError = require("../errors");
const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product: product });
};
const getAllProducts = async (req, res) => {
  const {
    search,
    freeShipping,
    price,
    category,
    company,
    featured,
    averageRating,
  } = req.query;
  let objectQuery = {};
  if (search) {
    objectQuery.name = { $regex: search, $options: "i" };
  }
  if (freeShipping) {
    objectQuery.freeShipping = freeShipping === "true" ? true : false;
  }
  if (featured) {
    objectQuery.featured = featured === "true" ? true : false;
  }
  if (category && category !== "all") {
    objectQuery.category = category;
  }
  if (company && company !== "all") {
    objectQuery.company = company;
  }
  let products = await Product.find(objectQuery);

  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "reviews"
  );
  if (!product) {
    throw new CustomError.BadRequestError(
      `No product with id : ${req.params.id}`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new CustomError.BadRequestError(
      `No product with id : ${req.params.id}`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    throw new CustomError.BadRequestError(
      `No product with id : ${req.params.id}`
    );
  }
  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No image uploaded");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Image size can not be bigger than 1MB"
    );
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + productImage.name
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
