# Shopping Cart: SDET Technical Round

This repository contains a small shopping cart application for an online appliance store. It has a React + TypeScript frontend and an Express + TypeScript backend that uses Knex with SQLite.

**Your task:** write automated tests for this application based on the requirements below.

---

## Your Task

1. Clone this repository and get the app running (see [Running the App](#running-the-app)).
2. Read the [Requirements](#requirements) carefully. They describe how the app is **supposed** to work.
3. Write **automated tests** that check the app against these requirements. You decide what to test and how.
4. If the app does not behave as the requirements say, report it (see [What to Submit](#what-to-submit)).

You may use any test tools you like, for example Jest or Vitest, Supertest, React Testing Library, Playwright or Cypress.

**Time:** 3 hours.

### Rules

- Do **not** change the application's behaviour. Small changes that only make the app easier to test are fine, but explain them in `TESTING.md`.
- Keep your camera and screen sharing on for the whole interview.
- You can search Google and read documentation.
- No ChatGPT, AI tools or coding agents (Claude Code, Cursor, Copilot, etc.).

---

## Running the App

You need **Node.js 18 or newer**. No database setup is needed; SQLite creates a local file automatically.

**Backend** (runs on http://localhost:4000):

```bash
cd server
npm install
npm run dev
```

**Frontend** (runs on http://localhost:5173), in a second terminal:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Useful for testing

- `npm run db:reset` (in `server/`) empties the cart and restores the original products.
- The database file can be changed with the `DB_FILE` environment variable, e.g. `DB_FILE=test.sqlite`, so tests can use a separate database.
- `server/src/app.ts` exports the Express `app` without starting a server, so it can be used directly with Supertest.
- `server/src/db.ts` exports `resetDatabase()`.

---

## Requirements

### Products

The store sells these products. They are added to the database automatically when the server starts.

| ID | Product | Price (₹) | Stock |
|---|---|---|---|
| 1 | Blender | 5,000 | 10 |
| 2 | Chopper | 1,500 | 5 |
| 3 | Kettle | 2,000 | 2 |
| 4 | Cooktop | 4,000 | 0 |

There is one shared cart. There are no users or logins.

### API Endpoints

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/cart` | Get the cart with totals |
| `POST` | `/api/cart/items` | Add a product to the cart |
| `DELETE` | `/api/cart/items/:id` | Remove an item from the cart |

All errors return JSON in this format:

```json
{ "error": "Not enough stock" }
```

---

#### `GET /api/products`

Returns every product.

**Response `200`**

```json
[
  { "id": 1, "name": "Blender", "price": 5000, "stock": 10 },
  { "id": 2, "name": "Chopper", "price": 1500, "stock": 5 },
  { "id": 3, "name": "Kettle", "price": 2000, "stock": 2 },
  { "id": 4, "name": "Cooktop", "price": 4000, "stock": 0 }
]
```

---

#### `GET /api/cart`

Returns the current cart.

**Response `200`**

```json
{
  "items": [
    { "id": 1, "productId": 1, "name": "Blender", "price": 5000, "quantity": 2, "lineTotal": 10000 }
  ],
  "subtotal": 10000,
  "discount": 1000,
  "total": 9000
}
```

| Field | Meaning |
|---|---|
| `items[].id` | Cart item id (use this to remove the item) |
| `items[].productId` | Id of the product |
| `items[].quantity` | How many of this product are in the cart |
| `items[].lineTotal` | price × quantity |
| `subtotal` | Sum of all line totals |
| `discount` | 10% of the subtotal when the subtotal is ₹10,000 or more, otherwise 0 |
| `total` | subtotal − discount |

---

#### `POST /api/cart/items`

Adds a product to the cart. If the product is already in the cart, its quantity is increased.

**Request body**

```json
{ "productId": 3, "quantity": 1 }
```

| Field | Rules |
|---|---|
| `productId` | Required. Id of an existing product |
| `quantity` | Required. Whole number from 1 to 5 |

**Response `201`:** the updated cart (same format as `GET /api/cart`).

**Errors**

| Status | When |
|---|---|
| `400` | `quantity` is missing, not a whole number, or not between 1 and 5 |
| `400` | The product's total quantity in the cart would go above 5 |
| `400` `"Not enough stock"` | The product's total quantity in the cart would go above its stock |
| `400` `"Out of stock"` | The product's stock is 0 |
| `404` | No product with this `productId` |

**Example**

```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

---

#### `DELETE /api/cart/items/:id`

Removes an item from the cart. `:id` is the **cart item id** (`items[].id`), not the product id.

**Response `200`:** the updated cart (same format as `GET /api/cart`).

**Errors**

| Status | When |
|---|---|
| `404` | No cart item with this id |

**Example**

```bash
curl -X DELETE http://localhost:4000/api/cart/items/1
```

### Business Rules

**Adding to the cart**

1. `quantity` must be a **whole number from 1 to 5**. Anything else returns `400`.
2. Adding a product that is already in the cart **increases its quantity**. It does not create a second line.
3. The quantity of one product in the cart can never be more than **5**. Going over returns `400`.
4. The quantity of one product in the cart can never be more than its **stock**. Going over returns `400` with the error `"Not enough stock"`.
5. A product with stock `0` cannot be added. This returns `400` with the error `"Out of stock"`.
6. A `productId` that does not exist returns `404`.
7. Adding to the cart does **not** change the product's stock.

**Removing from the cart**

8. Removing an item takes it out of the cart and returns the updated cart.
9. Removing an item `id` that is not in the cart returns `404`.

**Totals**

10. `lineTotal` = price × quantity.
11. `subtotal` = sum of all `lineTotal` values.
12. If the subtotal is **₹10,000 or more**, a **10% discount** is applied. Otherwise the discount is `0`.
13. `total` = subtotal − discount.
14. An empty cart has subtotal, discount and total of `0`.

### Frontend

15. The page lists every product with its name, price and stock.
16. In-stock products have a quantity box and an **Add to Cart** button.
17. Out-of-stock products show a disabled **Out of Stock** button instead.
18. The cart section shows each item's name, quantity and line total, with a **Remove** button.
19. The cart section shows the subtotal, discount and total, and these always match the items in the cart.
20. When the cart is empty, the page shows "Your cart is empty".
21. When an action fails, the error message from the API is shown on the page.

---

## What to Submit

Push your work to a new branch or your own copy of this repository, including:

1. **Your automated tests**, which run with a single command.
2. A **`TESTING.md`** file that contains:
   - How to run your tests
   - What you tested and why (your approach)
   - An **issues list** (if you find any): for each issue, the steps to reproduce it, the expected result, the actual result, and the related requirement
   - Anything you would test next if you had more time

## How You Will Be Judged

- **Coverage:** do your tests check every requirement?
- **Test quality:** are the tests readable, independent of each other and easy to run? Do they cover both correct and incorrect inputs?
- **Test choices:** did you test at the right levels (logic, API, UI)?
- **Reporting:** are your findings clear enough for a developer to reproduce?
