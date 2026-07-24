export const formattedWishlistItems = (items) => {
  return items.map((item) => {
    const {
      productId: { _id, name, price, images },
    } = item;

    return {
      productId: _id,
      name,
      price,
      thumbnail: images[0],
    };
  });
};
