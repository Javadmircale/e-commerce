const { createJWT, attachCookiesToResponse } = require("./jwt");

const createTokenUser = ({ res, user }) => {
  const userToken = { userId: user._id, email: user.email, role: user.role };
  attachCookiesToResponse({ res: res, user: userToken });
  return userToken;
};
module.exports = createTokenUser;
