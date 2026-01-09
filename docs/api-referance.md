[Back](index.md)

# API Referances - Ekart V1

This document lists all available API endpoints in Ekart V1 along with their inputs and outputs.

---

## Public APIs

Public APIs do not require authentication.

---

### `GET /products`

Returns all active products available in the store.

**Headers**

- None

**Response**

- success: true
- products: list of active products, each containing:
  - productId
  - name
  - price
  - imageUrl
- size: number of products returned

## User APIs

User APIs require authentication using a Firebase ID token.

---

### `GET /orders`

Returns all orders created by the logged-in user.

**Headers**

- Authorization: Bearer `<Firebase_ID_Token>`

**Response**

- success: true
- data: list of user orders, each containing:
  - orderId
  - items
  - orderStatus
  - paymentStatus
  - totalAmount
  - shippingStatus

## Payment APIs

Payment APIs are used to create and verify payments using Razorpay.
All pricing is calculated on the backend.

---

### `POST /payments/create-payment`

Creates a Razorpay order for the given cart items.

**Headers**

- Authorization: Bearer <`Firebase_ID_Token`>
- Content-Type: `application/json`

**Body**

- items: list of product IDs and quantity

**Response**

- success: true
- order: order details (id, amount, currency, createdAt, etc)

---

### POST `/payments/verify-payment`

Verifies the Razorpay payment and create an order.

**Headers**

- Authorization: Bearer <`Firebase_ID_Token`>
- Content-Type: `application/json`

**body**

- items
- paymentDetails
  - razorpayOrderId
  - razorpayPaymentId
  - razorpaySignature

**Response**

- success: true
- orderId: created order ID

## Admin APIs

Admin APIs require authentication and admin role access.

### `POST /admin/products`

Creates a new product with image upload.

**Headers**

- Authorization: Bearer `<Firebase_ID_Token>`
- Content-Type: `multipart/form-data`

**Body**

- file: product image file
- data:
  - name: product name
  - price: product price
  - isActive: boolean

**Response**

- success: true
- data:
  - productId
  - product
    - name
    - price
    - isActive
    - imageUrl
    - createdAt: timestamp
    - updatedAt: timestamp

---

### `GET /admin/orders`

Returns all orders in the database.

**Headers**

- Authorization: Bearer `<Firebase_ID_Token>`

**Response**

- success: true
- orders: list of orders, each order containing:
  - userId
  - userMail
  - items
  - totalAmount
  - curreny
  - paymentStatus
  - paymentDetails
  - OrderStatus, etc
- size: total number of orders

---

### `PATCH /admin/orders/:id`

Updates order and shipping status.

**Headers**

- Authorization: Bearer `<Firebase_ID_Token>`
- Content-Type: `application/json`

**QueryParams**

- id: orderID

**Body**

- orderStatus (optional)
- shippingStatus (optional)
- trackingId (optional)

**Response**

- success: true
- data: updated order details
