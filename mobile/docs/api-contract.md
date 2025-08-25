# Mobile Upload API Contract (Linode)

Base URL: https://www.smellsgoodfeelbeter.com

Endpoint:
- POST /api/mobile/products
- Auth: Authorization: Bearer <MOBILE_API_TOKEN>
- Content-Type: multipart/form-data

Form fields:
- product_name (required), product_description (optional),
- price (required number), quantity (required integer),
- product_image (required JPEG/PNG)

On 201:
{ "success": true, "product": { "id": <number>, "product_name": "...",
  "image_name": "...",
  "image_url": "https://www.smellsgoodfeelbeter.com/images/<image_name>" } }

Notes:
- Images saved on Linode under /sgfb/public/images/
- DB column for image filename: products.image_name
