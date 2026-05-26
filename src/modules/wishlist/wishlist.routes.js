const router = require("express").Router();
const { ROLES } = require("../../constants/roles");
const {
  verifyAuth,
  requireRole,
} = require("../../middlewares/auth.middleware");
const C = require("./wishlist.controller");

router.get("/wishlist", verifyAuth, requireRole([ROLES.USER]), C.getWishListController);
router.post("/wishlist", verifyAuth, requireRole([ROLES.USER]), C.addItemToWishListController);
router.delete(
  "/wishlist/:productId",
  verifyAuth,
  requireRole([ROLES.USER]),
  C.deleteItemInWishListController,
);
router.delete("/wishlist", verifyAuth, requireRole([ROLES.USER]), C.deleteWishListController);

module.exports = router;
