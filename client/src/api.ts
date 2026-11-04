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

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error ?? 'Request failed');
  }
  return body as T;
}

export const api = {
  getProducts: () => request<Product[]>('/api/products'),
  getCart: () => request<Cart>('/api/cart'),
  addToCart: (productId: number, quantity: number) =>
    request<Cart>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  removeFromCart: (itemId: number) =>
    request<Cart>(`/api/cart/items/${itemId}`, { method: 'DELETE' }),
};
