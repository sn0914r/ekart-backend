# Ekart Backend (Single Vendor)

A **Single-vendor** e-commerce backend built to demonstrate secure authentication, product management, order processing, and payment verification using Razorpay.

---

## Tech Stack

- Node.js
- Express.js
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

### Products

- Admin can create products with image upload
- Public product listing (`GET /products`)
- Only active products are visible to users

### Orders & Payments

- Backend-only pricing
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
  - tracking ID

---

## Payment Flow

1. User initiates checkout
2. Backend calculates total price and creates Razorpay order
3. User completes payment via Razorpay
4. Backend verifies payment signature
5. Order is saved in Firestore
6. Email notifications are sent

---

## API Endpoints

### Public

- `GET /products `:- view all active products

### User

- `GET /orders `:- view orders created by the user (authentication token is required)

### Payments (User)

- `POST /payments/create-payment" `:- creates a Razorpay order (_backend takes the product ids along with quantity and calculates the total price_)

- `POST /payments/verify-payment" `:- verify Razorpay payment and create order record

### Admin

- `POST /admin/products `:- create a product with image upload

- `GET /admin/orders `:- view all orders

- `PATCH /admin/orders/:id`:- Update order status, shipping status, and tracking ID

---

## Security Notes

- Pricing is calculated on the backend
- Payments are verifies using Razorpay signatures
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
│   ├── errors/
│   ├── middlewares/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
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

## Documentation

Detailed workflows, request/response formats, and schemas are available in the [docs](docs/index.md) directory.

---

## Status

**V1 - Completed**
