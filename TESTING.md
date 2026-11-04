# Testing documentation

## How to run test
1. Ensure dependencies are installed
2. Run the automated test suite: `npx test` or `npx jest`

## What was tested  and Testing Approach
- **Intergation Testing with supertest**: verified all Rest API endpoints (`GET /api/products` , `GET/api/cart`, `POST /api/cart/items`, `Delete /api/cart/items:id `).
- **Bussiness Logic and Edge Cases**:
- Quantity validation(must be between 1 and 5)  or missing.
- Stock limits check(`Out of stock ` and  `Not enough stock ` error messages).
- Item addition/ quanity increment logic  for duplicate cart items.
- Non-existent resource handling (404 errors for invalid prodcut or cart item IDs ).

## Issues list:
-- **Product Missing Check**: Handled unhandled null product queries that previosuly resulted i `500 Internal Server Error` instead of `404 Not Found`.
-- **Stock Limit Accumulation**: Ensured total cart quanitity( existing + new) is calculated against remaining stock.

## Future improvements
-- **Concurrency and Race Condition**: Test the POST request using parallel asyn requests.
-- **Load Testing**: Measure API response latency under loads.
-- **UI Testing: Try and test the ui level testing under real data.

