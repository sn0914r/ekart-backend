const formattedWishlistItems = (items) =>
  items.map((item) => {
    const {
      productId: { _id, name, price, images, attributes },
    } = item;

    return {
      productId: _id,
      name,
      price,
      thumbnail: images[0],
    };
  });

module.exports = { formattedWishlistItems };
