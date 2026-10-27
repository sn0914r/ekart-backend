import ProductModel from "#db/models/product.model.js";
import { PRODUCT } from "#constants/index.js";

const { SORT_PRICE, STOCK_STATUS, VALID_SORT_FIELDS, ACTIVE_STATUS } = PRODUCT;

export class ProductRepository {
  /**
   * Normalizes pagination query params
   * @param {{page?: string | number, limit?: string | number}} [query={}]
   * @returns {{page: number, limit: number, skip: number}}
   */
  static #buildPagination(query = {}) {
    let { page = 1, limit = 10 } = query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Builds MongoDB filter object from query params
   * @param {object} [query={}]
   * @param {{activeOnly?: boolean}} [options={}]
   * @returns {Record<string, unknown>}
   */
  static #buildFilter(query = {}, { activeOnly = false } = {}) {
    const {
      minPrice = null,
      maxPrice = null,
      search = null,
      category = null,
      status = null,
      stockStatus = null,
    } = query;

    const filters = {};

    if (activeOnly) {
      filters.isActive = true;
    } else if (status && Object.keys(ACTIVE_STATUS).includes(status)) {
      filters.isActive = ACTIVE_STATUS[status];
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      filters.$or = [
        { name: { $regex: trimmed, $options: "i" } },
        { category: { $regex: trimmed, $options: "i" } },
      ];
    }

    if (category) {
      filters.category = category;
    }

    if (stockStatus && Object.keys(STOCK_STATUS).includes(stockStatus)) {
      if (stockStatus === STOCK_STATUS.IN_STOCK) {
        filters.stock = { $gt: 10 };
      } else if (stockStatus === STOCK_STATUS.LOW_STOCK) {
        filters.stock = { $gt: 0, $lte: 10 };
      } else if (stockStatus === STOCK_STATUS.OUT_OF_STOCK) {
        filters.stock = 0;
      }
    }

    if (minPrice !== null || maxPrice !== null) {
      filters.price = {};
      if (minPrice !== null) filters.price.$gte = Number(minPrice);
      if (maxPrice !== null) filters.price.$lte = Number(maxPrice);
    }

    return filters;
  }

  /**
   * Builds MongoDB sort object from query params
   * @param {{sort?: string}} [query={}]
   * @returns {Record<string, 1 | -1>}
   */
  static #buildSort(query = {}) {
    const { sort = null } = query;
    const sortOptions = {};

    if (!sort) {
      return { createdAt: -1 };
    }

    if (sort === SORT_PRICE.PRICE_ASC) return { price: 1, createdAt: -1 };
    if (sort === SORT_PRICE.PRICE_DESC) return { price: -1, createdAt: -1 };
    if (sort === SORT_PRICE.NEWEST) return { createdAt: -1 };

    const sortedFields = sort.split(",");
    const filteredSortFields = sortedFields.filter((e) =>
      VALID_SORT_FIELDS.includes(e.trim()),
    );

    filteredSortFields.forEach((field) => {
      const cleanField = field.trim();
      const isDesc = cleanField.startsWith("-") ? -1 : 1;
      const fieldName = isDesc === -1 ? cleanField.slice(1) : cleanField;

      sortOptions[fieldName] = isDesc;
    });

    if (!sortOptions.createdAt) {
      sortOptions.createdAt = -1;
    }

    return sortOptions;
  }

  /**
   * @param {object} [query={}]
   * @param {{activeOnly?: boolean, projection?: object}} [options={}]
   * @returns {Promise<{products: Array<object>, total: number, page: number, limit: number}>}
   */
  static async findPaginatedProducts(
    query = {},
    { activeOnly = false, projection = null } = {},
  ) {
    const filter = ProductRepository.#buildFilter(query, { activeOnly });
    const sort = ProductRepository.#buildSort(query);
    const { skip, limit, page } = ProductRepository.#buildPagination(query);

    const defaultProjection = activeOnly
      ? {
          name: 1,
          price: 1,
          stock: 1,
          images: { $slice: 1 },
          category: 1,
          attributes: 1,
        }
      : {
          name: 1,
          price: 1,
          stock: 1,
          images: { $slice: 1 },
          category: 1,
          isActive: 1,
          description: 1,
          attributes: 1,
        };

    const finalProjection = projection || defaultProjection;

    const [products, total] = await Promise.all([
      ProductModel.find(filter, finalProjection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total, page, limit };
  }

  /**
   * @param {string} id
   * @param {string|object} [projection=null]
   * @returns {Promise<object|null>}
   */
  static async findProductById(id, projection = null) {
    let query = ProductModel.findById(id);
    if (projection) {
      query = query.select(projection);
    }
    return await query.lean();
  }

  /**
   * @param {object} productData
   * @returns {Promise<object>}
   */
  static async createProduct(productData) {
    const product = await ProductModel.create(productData);
    return product.toObject();
  }

  /**
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object|null>}
   */
  static async updateProductById(id, updates) {
    return await ProductModel.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    ).lean();
  }

  /**
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async deleteProductById(id) {
    return await ProductModel.findOneAndDelete({ _id: id }).lean();
  }

  /**
   * @param {object} [filter={ isActive: true }]
   * @returns {Promise<string[]>}
   */
  static async findDistinctCategories(filter = { isActive: true }) {
    return await ProductModel.distinct("category", filter);
  }

  /**
   * Get min and max price range
   * @param {object} [filter={ isActive: true }]
   * @returns {Promise<{min: number, max: number}>}
   */
  static async getPriceRange(filter = { isActive: true }) {
    const result = await ProductModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    return {
      min: result[0]?.minPrice ?? 0,
      max: result[0]?.maxPrice ?? 0,
    };
  }

  /**
   * @param {string} name
   * @returns {Promise<Array<{_id: string, color: string}>>}
   */
  static async findColorVariantsByProductName(name) {
    return await ProductModel.find(
      { name, isActive: true },
      {
        _id: 1,
        color: "$attributes.color",
      },
    ).lean();
  }
}
