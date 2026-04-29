const { logger } = require("../../../utils/logger");

const formattedWishlistItems = (items) =>
  items.map((item) => {
    const {
      productId: { _id, name, price, images },
    } = item;

    logger.info("item",{
      productId: _id,
      name,
      price,
      thumbnail: images[0],
    });

    return {
      productId: _id,
      name,
      price,
      thumbnail: images[0],
    };
  });

module.exports = { formattedWishlistItems };
