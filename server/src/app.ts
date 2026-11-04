import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { addToCart, CartError, getCart, listProducts, removeFromCart } from './cart';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/products', async (_req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (err) {
    next(err);
  }
});

app.get('/api/cart', async (_req, res, next) => {
  try {
    res.json(await getCart());
  } catch (err) {
    next(err);
  }
});

app.post('/api/cart/items', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    res.json(await addToCart(Number(productId), quantity));
  } catch (err) {
    next(err);
  }
});

app.delete('/api/cart/items/:id', async (req, res, next) => {
  try {
    res.json(await removeFromCart(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CartError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});
