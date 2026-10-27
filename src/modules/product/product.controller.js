import { ProductService } from "./product.service.js";

export class ProductController {
  /**
   * @route GET /products
   * @access Public
   */
  static async getActiveProducts(req, res) {
    const products = await ProductService.getActiveProducts(req.query);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  }

  /**
   * @route GET /products/:id
   * @access Public
   */
  static async getActiveProductDetails(req, res) {
    const { id } = req.params;
    const product = await ProductService.getActiveProductDetails(id);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  }

  /**
   * @route GET /products/colors?name=productName
   * @access Public
   */
  static async getProductColors(req, res) {
    const { name } = req.query;
    const colors = await ProductService.getProductColors(name);

    return res.status(200).json({
      success: true,
      message: "Available colors fetched successfully",
      data: colors,
    });
  }

  /**
   * @route GET /products/meta
   * @access Public
   */
  static async getProductMeta(req, res) {
    const meta = await ProductService.getProductMeta();

    return res.status(200).json({
      success: true,
      message: "Product metadata fetched successfully",
      data: meta,
    });
  }

  /**
   * @route GET /admin/products
   * @access Private (Admin, Demo Admin)
   */
  static async adminGetProductsList(req, res) {
    const { products, pagination } = await ProductService.adminGetProductsList(
      req.query,
    );

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination,
    });
  }

  /**
   * @route GET /admin/products/:id
   * @access Private (Admin, Demo Admin)
   */
  static async adminGetProductById(req, res) {
    const { id } = req.params;
    const product = await ProductService.adminGetProductById(id);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  }

  /**
   * @route POST /admin/products
   * @access Private (Admin)
   */
  static async adminAddProduct(req, res) {
    const { files } = req;
    const { name, price, isActive, stock, description, category, attributes } =
      req.body;

    const product = await ProductService.adminAddProduct({
      files,
      name,
      price,
      isActive,
      stock,
      description,
      category,
      attributes,
    });

    return res.status(200).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  }

  /**
   * @route PATCH /admin/products/:id
   * @access Private (Admin)
   */
  static async adminUpdateProduct(req, res) {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await ProductService.adminUpdateProduct(id, updates);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  }

  /**
   * @route DELETE /admin/products/:id
   * @access Private (Admin)
   */
  static async adminDeleteProduct(req, res) {
    const { id } = req.params;

    const deletedProduct = await ProductService.adminDeleteProduct(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  }
}
