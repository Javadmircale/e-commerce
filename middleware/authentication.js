const CustomErr = require("../errors");
const { verifyJWT } = require("../utils");
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomErr.UnauthenticatedError("Token must be provided...");
  }

  try {
    const { email, userId, role } = await verifyJWT({ payload: token });
    req.user = { email, userId, role };
    next();
  } catch (error) {
    throw new CustomErr.UnauthenticatedError("invalid token");
  }
};

const unAuthorizedPermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomErr.UnauthorizedError(
        "Unauthorized to access this route..."
      );
    }
    next();
  };
};
module.exports = { authenticateUser, unAuthorizedPermission };
