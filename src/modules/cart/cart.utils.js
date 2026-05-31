const formatCartList = (cartList) => {
  return cartList.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    thumbnail: item.productId.images[0],
    stock: item.productId.stock,
    quantity: item.quantity,
    size: item.variant.size,
    color: item.productId.attributes.color
  }));
};

module.exports = { formatCartList };
