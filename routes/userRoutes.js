const router = require("express").Router();
const {
  authenticateUser,
  unAuthorizedPermission,
} = require("../middleware/authentication");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router
  .route("/")
  .get(
    authenticateUser,
    unAuthorizedPermission("admin", " owner"),
    getAllUsers
  );
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
