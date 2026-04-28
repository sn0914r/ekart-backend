const router = require("express").Router();
const {
  verifyAuth,
  requireUser,
} = require("../../middlewares/auth.middleware");
const C = require("./wishlist.controller");

router.get("/wishlist", verifyAuth, requireUser, C.getWishListController);
router.post("/wishlist", verifyAuth, requireUser, C.addItemToWishListController);
router.delete(
  "/wishlist/:productId",
  verifyAuth,
  requireUser,
  C.deleteItemInWishListController,
);
router.delete("/wishlist", verifyAuth, requireUser, C.deleteWishListController);

module.exports = router;
