# eKart Backend

REST API backend for handling authentication, products, orders, payments, and admin operations in the eKart ecommerce platform.

---

## Live Demo

Health Endpoint: `https://ekart-backend-9y0c.onrender.com/health`

---

## Related Repositories

- [eKart-frontend](https://github.com/sn0914r/ekart-frontend)
- [eKart-admin-panel](https://github.com/sn0914r/ekart-admin-panel)
- [eKart System](https://github.com/sn0914r/eKart-system)

---

## Features

### Authentication & Authorization

- JWT based authentication with Access and Refresh tokens.
- Secure refresh token flow using HTTP-only cookies.
- Role-Based Access Control (RBAC) for User and Admin roles.
- Protected middleware for route-level authorization.

### Product Management

- Full CRUD operations for products (Admin only).
- Advanced filtering, sorting, and pagination for product listings.
- Inventory tracking with automatic stock reduction upon successful payment.
- Multi-image uploads integrated with Cloudinary.

### Orders & Payments

- Order creation with snapshot-based item storage to preserve pricing at time of purchase.
- Razorpay payment gateway integration.
- Server-side payment signature verification.
- Transaction-safe order confirmation and stock updates.
- Automated order confirmation emails via Nodemailer.

### User Features

- Persistent cart management APIs.
- Wishlist functionality for saved products.
- Comprehensive order history for authenticated users.

### Backend Infrastructure

- Modular domain-driven architecture (Auth, Product, Order, etc.).
- Joi-based request validation and standardized API responses.
- API rate limiting on sensitive endpoints (Payments).
- Security headers with Helmet and CORS configuration.
- Structured request logging middleware.

---

## Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose (ODM)

### Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt (Password hashing)
- Helmet & CORS
- express-rate-limit

### Payments & Uploads

- Razorpay
- Cloudinary
- Multer

### Validation & Utilities

- Joi (Request validation)
- Nodemailer (Email notifications)
- NanoID

---

## Folder Structure

```text
src/
├── clients/
├── configs/
├── constants/
├── errors/
├── middlewares/
├── models/
├── modules/
│   ├── auth/
│   ├── cart/
│   ├── order/
│   ├── payment/
│   └── product/
├── providers/
├── templates/
└── utils/
```

---

## Environment Variables

The following environment variables are required to run the project. See `.env.example` for details.

```bash
PORT=3000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:5173

MONGO_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_TEST_API_KEY=
RAZORPAY_TEST_KEY_SECRET=

GMAIL=
GMAIL_PASSWORD_KEY=

JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
JWT_ACCESS_TOKEN_EXPIRES=
JWT_REFRESH_TOKEN_EXPIRES=
```

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sn0914r/ekart-backend.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Copy contents from `.env.example` and fill in your credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## API Endpoints

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Products

- `GET /products`
- `GET /products/colors`
- `GET /products/:id`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `DELETE /admin/products/:id`

### Cart

- `GET /cart`
- `POST /cart/add`
- `PATCH /cart/increase`
- `PATCH /cart/decrease`
- `DELETE /cart/remove/:id`
- `DELETE /cart/clear`

### Wishlist

- `GET /wishlist`
- `POST /wishlist`
- `DELETE /wishlist/:productId`
- `DELETE /wishlist`

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /admin/orders`
- `PATCH /admin/orders/:id`

### Payments

- `POST /payments/create`
- `POST /payments/verify`

### Admin Insights

- `GET /admin/dashboard`
- `GET /admin/analytics`

---

## Security

The backend includes multiple security layers for authentication, authorization, and payment verification:

- **JWT Authentication**: All sensitive routes are protected by JWT verification.
- **RBAC**: Access to admin functionalities is restricted to users with the `admin` role.
- **Password Hashing**: User passwords are encrypted using `bcrypt` before storage.
- **Request Validation**: All incoming request bodies and parameters are validated using Joi schemas.
- **Razorpay Security**:
  - All pricing and order amounts are calculated server-side.
  - Razorpay orders are generated on the server to prevent client-side tampering.
  - Payment signatures are verified using the `crypto` module before any order is persisted or stock is reduced.
  - Idempotency checks are performed to prevent duplicate payment processing.
- **Error Handling**: A centralized error handling middleware prevents sensitive stack traces from being exposed in production.
