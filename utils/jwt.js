const jwt = require("jsonwebtoken");
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const verifyJWT = ({ payload }) => {
  const token = jwt.verify(payload, process.env.JWT_SECRET);
  return token;
};
const attachCookiesToResponse = ({ res, user }) => {
  const oneDay = 1000 * 60 * 60 * 24;
  const token = createJWT({ payload: user });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};
module.exports = { createJWT, verifyJWT, attachCookiesToResponse };
