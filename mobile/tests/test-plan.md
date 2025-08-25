# Test Plan

1) API sanity (curl/Postman) against https://www.smellsgoodfeelbeter.com/api/mobile/products
2) Verify file saved in /sgfb/public/images and row in products.image_name
3) Negative cases: 401 (no token), 413 (too big), 415/400 (bad file/fields)
4) On-device test after Android UI exists
