[Back](index.md)

# Products

## Admin Product Creation

Admins can create products with image upload.

### Flow

1. Token is verified.
2. Admin role is checked.
3. Product data is validated.
4. Image is uploaded to storage.
5. Product is saved in the database.

## Public Product Listing

- Public user can view products.
- Only active products are returned from the server (`isActive=true`)
