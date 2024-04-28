const Product = require("../models/ProductModel");
const Review = require("../models/ReviewModel");
const { checkPermissions } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createReview = async (req, res) => {
  const product = await Product.findOne({ _id: req.body.product });
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product with id : ${req.body.productId}`
    );
  }
  const alreadySubmitted = await Review.findOne({
    user: req.user.userId,
    product: req.body.product,
  });
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product..."
    );
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({ path: "product", select: "name company price" })
    .populate({ path: "user", select: "name" });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
  const review = await Reviews.findOne({ _id: req.params.id });
  res.send("getSingleReview Review");
};
const updateReview = async (req, res) => {
  const {
    body: { title, rating, comment },
    params: { id: reviewId },
    user,
  } = req;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  }
  checkPermissions(user, review.user);
  review.title = title;
  review.rating = rating;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id : ${req.params.id}`);
  }
  checkPermissions(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Success! Review removed." });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
