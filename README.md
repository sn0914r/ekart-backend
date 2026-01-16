# Ekart Backend (Single Vendor)

A **Single-vendor** e-commerce backend built to demonstrate secure authentication, product management, order processing, and payment verification using Razorpay.

---

## Tech Stack

- Node.js (`v18+`)
- Express.js (`v5`)
- Firebase Auth (authentication & roles)
- Firestore (database)
- Firebase Storage (product images)
- Razorpay (payments - test mode)
- Joi (request validation)
- Nodemailer (email notifications)

---

## Features (V1)

### Authentication & Authorization

- Firebase ID token verification
- Role-based access (public / user / admin )
- Admin-only protected routes
- User-only protected routes

### Products

- Admin can create products with image upload
- Public product listing (`GET /products`)
- Only active products are visible to users (`isActive=true`)

### Orders & Payments

- Backend-only pricing (prices are fetched using product IDs and calculated on the backend)
- Razorpay order creation (at server-side)
- Secure payment signature verification
- Orders saved only after successful verification
- Email notifications on successful order placement

### Orders Management

- Users can view only their own orders
- Admin can view all orders
- Admin can update
  - order status
  - shipping status

---

## Payment Flow

1. User initiates checkout, frontend sends cart items and firebase id token to backend
2. Backend calculates total price and creates Razorpay order and sends order ID to frontend
3. Frontend opens Razorpay checkout and the user completes payment
4. Backend verifies payment signature
5. Order is saved in Firestore
6. Email notifications are sent

---

## API Endpoints

### Public

- `GET /products `:- get all active products

- `POST /auth/register `:- creates user at backend & returns custom token (single sign-in) (not an ID token)

### User

- `GET /orders `:- get orders created by the user (authentication token is required)

### Payments (User)

- `POST /payments/create-payment `:- creates a Razorpay order

- `POST /payments/verify-payment `:- verifies Razorpay payment and create order

### Admin

- `POST /admin/products `:- create a product with image upload

- `GET /admin/orders `:- view all orders

- `PATCH /admin/orders/:id`:- Update orderstatus, and shipping status

- `PATCH /admin/products/:id`:- Update product details

---

## Security Notes

- Pricing is calculated on the backend
- Payments are verified using Razorpay signatures
- Orders are never created before verification
- Clients cannot modify sensitive fields

---

## Folder Structure

```text
ekart-backend/
├── docs/
│   ├── index.md
│   ├── api-reference.md
│   ├── auth.md
│   ├── products.md
│   ├── orders.md
│   ├── payments.md
│   └── development-log.md
│
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

**V1 - Completed**
