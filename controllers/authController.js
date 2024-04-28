const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { createTokenUser } = require("../utils");
const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments({})) === 0;
  req.body.role = isFirstAccount ? "admin" : "user";
  const user = await User.create(req.body);
  const userToken = await createTokenUser({ res, user });
  res.status(StatusCodes.CREATED).json({ user: userToken });
};
const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).send();
};
const login = async (req, res) => {
  const { password, email } = req.body;
  if (!password || !email) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with email : ${email}`);
  }
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new CustomError.UnauthenticatedError("Invalid password");
  }
  const userToken = await createTokenUser({ res, user });
  res.status(StatusCodes.OK).json({ user: userToken });
};

module.exports = { register, login, logout };
