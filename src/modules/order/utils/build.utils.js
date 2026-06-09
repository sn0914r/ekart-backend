export const buildProductQtyMapFromCart = (cart) => {
  return new Map(
    cart.items.map(({ productId, quantity }) => [
      productId.toString(),
      quantity,
    ]),
  );
};

export const buildOrderSnapshot = (targetProducts, cartProductsQtysMap) => {
  const orderSnapshot = targetProducts.map((prod) => {
    const orderItemQty = cartProductsQtysMap.get(prod._id.toString());

    return {
      productId: prod._id,
      quantity: orderItemQty,
      name: prod.name,
      unitPrice: prod.price,
      imageUrl: prod.images[0],
      lineTotal: prod.price * orderItemQty,
    };
  });

  return orderSnapshot;
};
