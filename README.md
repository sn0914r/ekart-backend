# Ekart Backend (Single Vendor)

A **Single-vendor** e-commerce backend built to demonstrate secure authentication, product management, order processing, and payment verification using Razorpay.

---

## Tech Stack

- Node.js (`v18+`)
- Express.js (`v5`)
- Firebase Auth (authentication & roles)
- MongoDB (database)
- Cloudinary (product images)
- Razorpay (payments - test mode)
- Joi (request validation)
- Nodemailer (email notifications)
- Helmet (secure headers)
- express-rate-limit (rate limiting)

---

## Features

### Authentication & Authorization

- Firebase ID token verification
- Role-based access (public / user / admin )
- Admin-only protected routes
- User-only protected routes
- Backend user registration (`/auth/register`) with default role support

### Products

- Admin can create products with image upload
- Product stock support (**available stock**)
- Public product listing (`GET /products`)
- Only active products are visible to users (`isActive=true`)
- Admin can update product details (`PATCH /admin/products/:id`)
  - name
  - price
  - isActive
  - stock

### Orders & Payments

- Backend-only pricing (prices are fetched using product IDs and calculated on the backend)
- Razorpay order creation (at server-side)
- Secure payment signature verification
- Orders saved only after successful verification
- Email notifications on successful order placement
- Stock is reduced only after successful payment verification
- Order snapshot feature (stores product price/details at order creation time)

### Orders Lifecycle Management (v2)

- improved order lifecycle validation
- Prevent invalid status transitions
- Admin can update order lifecycle safely

### Idempotency (v2)

- Duplicate payment verification is blocked.
- `POST /payments/verify` rejects if payment is already marked as **paid**.
- Prevents multiple orders from being created using the same payment details.

### Security Improvements (v2)

- Helmet enabled (secure headers)
- Rate limiting added on payment routes:
  - `POST /payments/create`
  - `POST /payments/verify`

---

## Payment Flow

1. User initiates checkout, frontend sends cart items and firebase ID token to backend
2. Backend calculates total price and creates Razorpay order and sends order ID to frontend
3. Frontend opens Razorpay checkout and the user completes payment
4. Frontend sends payment details + signatures to backend.
5. Backend verifies Razorpay signature
6. Backend checks idempotency (**reject if already paid**)
7. Order is saved in Database.
8. Product stock is reduced.
9. Email notifications are sent

---

## Roles (Public/User/Admin )

### Public

- No authentication required
- Can access:
  - `GET /products`

### User

- Authenticated user (Firebase ID token required)
- Can access:
  - `GET /orders`
  - `POST /payments/create`
  - `POST /payments/verify-payment`

### Admin

- Authenticated user with custom claim: `role="admin"`
- Can access:
  - `POST /admin/products`
  - `PATCH /admin/products/:id`
  - `GET /admin/orders`
  - `PATCH /admin/orders/:id`

---

## API Endpoints

### Public

- `GET /products `:- get all active products

- `POST /auth/register `:- creates user at backend & returns custom token (single sign-in) (not an ID token)

### User

- `GET /orders `:- get orders created by the user (authentication token is required)

### Payments (User)

- `POST /payments/create-payment `:- creates a Razorpay order (**backend-only pricing**)

- `POST /payments/verify-payment `:- verifies Razorpay payment and create order record

### Admin

- `POST /admin/products `:- create a product with image upload + stock

- `GET /admin/orders `:- view all orders

- `PATCH /admin/orders/:id`:- update the order status

- `PATCH /admin/products/:id`:- Update product details

---

## Security Notes

- Pricing is calculated on the backend
- Payments are verified using Razorpay signatures
- Orders are never created before verification
- Duplicate verification is blocked (idempotency)
- Clients cannot modify sensitive fields

---

## Folder Structure

```text
ekart-backend/

├── src/
│   ├── configs/
│   ├── controllers/
│   ├── db/
│   ├── errors/
│   ├── middlewares/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── validation/
│   ├── app.js
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Environment Variables

```bash
PORT=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=

# Razorpay
RAZORPAY_TEST_API_KEY=
RAZORPAY_TEST_KEY_SECRET=

# Nodemailer
GMAIL=
GMAIL_PASSWORD_KEY=
```

---

## Status

**v2 - Completed** (_v1 + \_v2 features included_)
