import { useEffect, useState } from 'react';
import { api, Cart, Product } from './api';

const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const EMPTY_CART: Cart = { items: [], subtotal: 0, discount: 0, total: 0 };

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCart()])
      .then(([productList, currentCart]) => {
        setProducts(productList);
        setCart(currentCart);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (productId: number) => {
    setError(null);
    try {
      setCart(await api.addToCart(productId, quantities[productId] ?? 1));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRemove = async (itemId: number) => {
    setError(null);
    try {
      await api.removeFromCart(itemId);
      setCart((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <p className="page">Loading...</p>;
  }

  return (
    <div className="page">
      <h1>Appliance Store</h1>

      {error && (
        <div className="error" role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      <section>
        <h2>Products</h2>
        <ul className="products">
          {products.map((product) => (
            <li key={product.id} className="product" data-testid={`product-${product.id}`}>
              <div>
                <strong>{product.name}</strong>
                <div>{formatPrice(product.price)}</div>
                <small>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</small>
              </div>
              {product.stock > 0 ? (
                <div className="actions">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    aria-label={`Quantity for ${product.name}`}
                    value={quantities[product.id] ?? 1}
                    onChange={(e) =>
                      setQuantities({ ...quantities, [product.id]: Number(e.target.value) })
                    }
                  />
                  <button onClick={() => handleAdd(product.id)}>Add to Cart</button>
                </div>
              ) : (
                <button disabled>Out of Stock</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section data-testid="cart">
        <h2>Your Cart</h2>
        {cart.items.length === 0 ? (
          <p data-testid="empty-cart">Your cart is empty</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id} data-testid={`cart-item-${item.productId}`}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>
                    <button onClick={() => handleRemove(item.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <dl className="totals">
          <dt>Subtotal</dt>
          <dd data-testid="subtotal">{formatPrice(cart.subtotal)}</dd>
          <dt>Discount</dt>
          <dd data-testid="discount">−{formatPrice(cart.discount)}</dd>
          <dt>Total</dt>
          <dd data-testid="total">{formatPrice(cart.total)}</dd>
        </dl>
      </section>
    </div>
  );
}
