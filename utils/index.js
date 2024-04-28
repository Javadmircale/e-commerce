const jwt = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermissions");
module.exports = { ...jwt, createTokenUser, checkPermissions };
