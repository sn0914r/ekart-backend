[Back](index.md)

# Payments

Payments are handled using Razorpay

## Routes

- `POST payments/create-payment`
- `POST payments/verify-payment`

## Flow

1. User sends cart items (each item's ID and quantity).
2. Backend calculates the total price.
3. Backend creates Razorpay order and sends the order ID to the frontend.
4. Frontend opens the Razorpay payment UI and user completes the payment.
5. Payment details along with payment signature are sent to backend.
6. Backend verifies the payment signature.
7. Order is created only after successful verification.

## Rules

- Pricing is calculated on backend only.
- Orders are never created before payment verification
