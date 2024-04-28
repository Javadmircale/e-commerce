const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../models/UserModel");
const { createTokenUser, checkPermissions } = require("../utils");
// GET ALL USERS
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ users: users });
};
// GET SINGLE USER
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions();
  res.status(StatusCodes.OK).json({ user: user });
};

// SHOW CURRENT USER
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// UPDATE USER
const updateUser = async (req, res) => {
  const {
    body: { email, name },
    user: { userId },
  } = req;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all credentials...");
  }
  const user = await User.findOne({ _id: userId });
  user.email = email;
  user.name = name;
  await user.save();
  const userToken = await createTokenUser({ res, user });
  res.status(StatusCodes.OK).json({ user: { ...userToken, name: user.name } });
};

// UPDATE USER PASSWORD
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword, newPasswordAgain } = req.body;
  if (!oldPassword || !newPassword || !newPasswordAgain) {
    throw new CustomError.BadRequestError("Please provide all credentials...");
  }
  if (newPassword !== newPasswordAgain) {
    throw new CustomError.BadRequestError("new password does not match!");
  }
  if (newPassword === oldPassword) {
    throw new CustomError.BadRequestError("Please enter a new password");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isValid = await user.comparePassword(oldPassword);
  if (!isValid) {
    throw new CustomError.UnauthenticatedError("Invalid password");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.ACCEPTED).json({ msg: "password is changed..." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
