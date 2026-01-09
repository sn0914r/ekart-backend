[Back](index.md)

# Authentication & Authorization

Ekart uses Firebase Authentication

## Flow

1. Client sends Firebase ID token.
2. Backend verifies the token.
3. User role is extracted from custom claims.
4. Access is allowed based on role.

## Roles

- Public: no token
- User: authenticated user with an ID token
- Admin: user with admin role (`role="admin"`)
