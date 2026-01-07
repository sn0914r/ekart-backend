## Product Creation Request Flow

**POST /admin/products**

When a request hits the `POST /admin/products` endpoint, it goes through the following steps before a product is finally created:

1. **Authentication**  
   The request first passes through the authentication middleware, where the Firebase ID token is verified to ensure the user is logged in.

2. **Authorization**  
   The authorization middleware then checks whether the authenticated user has admin role.

3. **Multipart Handling (Multer)**  
   The request is handled by Multer, which processes the `multipart/form-data` and stores image file in memory:

   - The image file is temporarily stored in memory.
   - Textual data is extracted into a predefined field called `data`.

4. **File Presence Check**  
   A custom `checkFile` middleware runs to ensure an image file is actually present in the request.  
   This is required because Multer does not throw an error when a file is missing by default.

5. **Body Parsing**  
   The `parseBody` middleware:

   - Checks whether the `data` field exists.
   - Parses the JSON string into a JavaScript object.
   - Attaches the parsed object to `req.body`.

6. **Validation (Joi)**  
   The validation middleware validates the parsed request body:

   - Ensures the data matches the expected schema.
   - Converts string values (such as numbers and booleans) into their correct data types.

7. **Controller Logic**  
   The request finally reaches the controller, where:

   - Validated data is extracted from the request.
   - Timestamps are generated on the server.
   - The `uploadImage` service is called to upload the image and obtain a public URL.
   - The `createRecord` service is called to store the product details in Firestore.

8. **Response**  
   The server responds with a success message along with the newly created product details.

---
