import swaggerJSDoc from "swagger-jsdoc";

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "eKart API",
      description: `
RESTful ecommerce backend supporting authentication, product management, cart, wishlist, orders, payments, and administrative operations.
Features include JWT authentication, role-based access control, Redis-backed rate limiting, Cloudinary image uploads, and a custom payment orchestrator integration.
Built with Node.js, Express.js, MongoDB, Redis, and Docker.
      `,
    },

    tags: [
      { name: "Authentication" },
      { name: "Products (Public)" },
      { name: "Products (Admin)" },
      { name: "Cart (User)" },
      { name: "Wishlist (User)" },
      { name: "Orders (User)" },
      { name: "Orders (Admin)" },
      { name: "Payment (User)" },
      { name: "Insights (Admin)" },
    ],

    servers: [
      {
        url: "/",
        description: "Current Environment",
      },
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
            errorCode: {
              type: "string",
              example: "INTERNAL_SERVER_ERROR",
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation error",
            },
            errorCode: {
              type: "string",
              example: "VALIDATION_ERROR",
            },
            errors: {
              type: "array",
              items: {
                type: "string",
              },
              example: [
                '"email" must be a valid email',
                '"password" length must be at least 6 characters long',
              ],
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./docs/**/*.yml"],
});
