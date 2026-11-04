import { db } from './db';

export const MAX_QUANTITY = 5;
export const DISCOUNT_THRESHOLD = 10000;
export const DISCOUNT_RATE = 0.1;

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export class CartError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function listProducts(): Promise<Product[]> {
  return db<Product>('products').select('id', 'name', 'price', 'stock').orderBy('id');
}

export function calculateTotals(items: Pick<CartItem, 'lineTotal'>[]) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = subtotal > DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export async function getCart(): Promise<Cart> {
  const rows = await db('cart_items')
    .join('products', 'products.id', 'cart_items.product_id')
    .select(
      'cart_items.id as id',
      'products.id as productId',
      'products.name as name',
      'products.price as price',
      'cart_items.quantity as quantity',
    )
    .orderBy('cart_items.id');

  const items: CartItem[] = rows.map((row) => ({ ...row, lineTotal: row.price * row.quantity }));
  return { items, ...calculateTotals(items) };
}

export async function addToCart(productId: number, quantity: unknown): Promise<Cart> {
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)|| quantity < 0 || quantity > MAX_QUANTITY) {
    throw new CartError(400, `Quantity must be between 1 and ${MAX_QUANTITY}`);
  }

  const product = (await db('products').where({ id: productId }).first()) as Product;
  if(!product){
    throw new CartError(404, 'No Product with this ProductId');
  }
  if (product.stock === 0) {
    throw new CartError(400, 'Product is unavailable');
  }

  const existing = await db('cart_items').where({ product_id: productId }).first();
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (newQuantity > MAX_QUANTITY) {
    throw new CartError(400, `You can have at most ${MAX_QUANTITY} of this product in your cart`);
  }
  if (newQuantity > product.stock) {
    throw new CartError(400, 'Not enough stock');
  }

  await db('cart_items').insert({ product_id: productId, quantity });

  return getCart();
}

export async function removeFromCart(itemId: number): Promise<Cart> {
  await db('cart_items').where({ id: itemId }).del();
  return getCart();
}
