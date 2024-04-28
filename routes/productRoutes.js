const router = require("express").Router();
const {
  authenticateUser,
  unAuthorizedPermission,
} = require("../middleware/authentication");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

router
  .route("/")
  .post(
    [authenticateUser, unAuthorizedPermission("admin", "owner")],
    createProduct
  )
  .get(getAllProducts);
router
  .route("/uploadImage")
  .post(
    [authenticateUser, unAuthorizedPermission("admin", "owner")],
    uploadImage
  );
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(
    [authenticateUser, unAuthorizedPermission("admin", "owner")],
    updateProduct
  )
  .delete(
    [authenticateUser, unAuthorizedPermission("admin", "owner")],
    deleteProduct
  );
module.exports = router;
