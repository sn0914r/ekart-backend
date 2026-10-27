import { redisClient } from "#clients/redis.js";
import { ERROR_CODES, PRODUCT } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import { CloudinaryProvider } from "#providers/cloudinary.provider.js";
import { ProductRepository } from "./product.repository.js";

export class ProductService {
  /**
   * @param {object} query
   * @returns {Promise<{page: number, totalPages: number, totalItems: number, products: object[]}>}
   */
  static async getActiveProducts(query) {
    const key = `products:${JSON.stringify(query) || ""}`;
    const cachedProductsData = await redisClient.get(key);

    if (cachedProductsData) {
      return JSON.parse(cachedProductsData);
    }

    const { products, total, page, limit } =
      await ProductRepository.findPaginatedProducts(query, {
        activeOnly: true,
      });

    const data = {
      page,
      totalPages: Math.ceil(total / limit) || 1,
      totalItems: total,
      products,
    };

    await redisClient.setex(key, 30, JSON.stringify(data));
    return data;
  }

  /**
   * @param {string} id
   * @returns {Promise<object>}
   */
  static async getActiveProductDetails(id) {
    const key = `product:${id}`;
    const cachedProduct = await redisClient.get(key);

    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const product = await ProductRepository.findProductById(id, {
      updatedAt: 0,
      createdAt: 0,
    });

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    await redisClient.setex(key, 3600, JSON.stringify(product));
    return product;
  }

  /**
   * @param {string} name
   * @returns {Promise<{_id: string, color: string}[]>}
   */
  static async getProductColors(name) {
    const key = `product:colors:${name}`;
    const cachedColors = await redisClient.get(key);

    if (cachedColors) {
      return JSON.parse(cachedColors);
    }

    const colors = await ProductRepository.findColorVariantsByProductName(name);

    await redisClient.setex(key, 3600, JSON.stringify(colors));
    return colors;
  }

  /**
   * @returns {Promise<object>}
   */
  static async getProductMeta() {
    const key = "products:meta";
    const cachedMeta = await redisClient.get(key);

    if (cachedMeta) {
      return JSON.parse(cachedMeta);
    }

    const [categories, priceRange] = await Promise.all([
      ProductRepository.findDistinctCategories({ isActive: true }),
      ProductRepository.getPriceRange({ isActive: true }),
    ]);

    const categoryOptions = categories
      .filter(Boolean)
      .sort()
      .map((cat) => ({
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: cat,
      }));

    const sortOptions = [
      { label: "Newest", value: PRODUCT.SORT_PRICE.NEWEST },
      { label: "Price: Low to High", value: PRODUCT.SORT_PRICE.PRICE_ASC },
      { label: "Price: High to Low", value: PRODUCT.SORT_PRICE.PRICE_DESC },
    ];

    const stockStatuses = [
      { label: "In Stock", value: PRODUCT.STOCK_STATUS.IN_STOCK },
      { label: "Low Stock", value: PRODUCT.STOCK_STATUS.LOW_STOCK },
      { label: "Out of Stock", value: PRODUCT.STOCK_STATUS.OUT_OF_STOCK },
    ];

    const productStatuses = [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "NOT_ACTIVE" },
    ];

    const data = {
      categories: categoryOptions,
      sortOptions,
      stockStatuses,
      productStatuses,
      priceRange,
    };

    await redisClient.setex(key, 3600, JSON.stringify(data));
    return data;
  }

  /**
   * @param {object} query
   * @returns {Promise<{products: object[], pagination: object}>}
   */
  static async adminGetProductsList(query) {
    const { products, total, page, limit } =
      await ProductRepository.findPaginatedProducts(query, {
        activeOnly: false,
      });

    return {
      products,
      pagination: {
        limit,
        page,
        totalProducts: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * @param {string} id
   * @returns {Promise<object>}
   */
  static async adminGetProductById(id) {
    const product = await ProductRepository.findProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }
    return product;
  }

  /**
   * @param {object} params
   * @param {Express.Multer.File[]} params.files
   * @param {string} params.name
   * @param {number} params.price
   * @param {boolean} params.isActive
   * @param {number} params.stock
   * @param {string} params.description
   * @param {string} params.category
   * @param {{color: string, size: string[]}} params.attributes
   * @returns {Promise<object>}
   */
  static async adminAddProduct({
    files,
    name,
    price,
    isActive,
    stock,
    description,
    category,
    attributes,
  }) {
    const images = await CloudinaryProvider.uploadImages(files);

    const product = await ProductRepository.createProduct({
      name,
      price,
      isActive,
      images,
      stock,
      description,
      category,
      attributes,
    });

    await ProductService.#invalidateProductCaches(product._id, name);
    return product;
  }

  /**
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object>}
   */
  static async adminUpdateProduct(id, updates) {
    const oldProduct = await ProductRepository.findProductById(id);
    if (!oldProduct) {
      throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    const updatedProduct = await ProductRepository.updateProductById(
      id,
      updates,
    );

    await ProductService.#invalidateProductCaches(id, oldProduct.name);
    if (updates.name && updates.name !== oldProduct.name) {
      await redisClient.del(`product:colors:${updates.name}`);
    }

    return updatedProduct;
  }

  /**
   * @param {string} id
   * @returns {Promise<object>}
   */
  static async adminDeleteProduct(id) {
    const deletedProduct = await ProductRepository.deleteProductById(id);
    if (!deletedProduct) {
      throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    await ProductService.#invalidateProductCaches(id, deletedProduct.name);
    return deletedProduct;
  }

  /**
   * @param {string} [productId]
   * @param {string} [productName]
   */
  static async #invalidateProductCaches(productId, productName) {
    const keys = await redisClient.keys("products:*");
    const keysToDelete = [...keys];

    if (productId) {
      keysToDelete.push(`product:${productId}`);
    }

    if (productName) {
      keysToDelete.push(`product:colors:${productName}`);
    }

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  }
}
