const buildProductQtyMap = (cart) => {
  return new Map(
    cart.items.map(({ productId, quantity }) => [productId, quantity]),
  );
};

const calculateSubtotal = (orderSnapshot) =>
  orderSnapshot.reduce((acc, cur) => acc + cur.lineTotal, 0);

module.exports = { buildProductQtyMap, calculateSubtotal };
