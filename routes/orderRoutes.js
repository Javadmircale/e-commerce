const router = require("express").Router();
const {
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  createOrder,
  updateOrder,
} = require("../controllers/orderController");
const {
  authenticateUser,
  unAuthorizedPermission,
} = require("../middleware/authentication");

router
  .route("/")
  .get([authenticateUser, unAuthorizedPermission("admin")], getAllOrders)
  .post(authenticateUser, createOrder);
router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);
router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
