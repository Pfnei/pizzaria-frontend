// utils/cartStorage.js
const CART_KEY = "pizzeria_cart_v1";

/**
 * cart = { items: [{ productId, productName, price, vegetarian, quantity }] }
 */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? { items: [] };
  } catch {
    return { items: [] };
  }
}

export function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();

  const productId = String(product.productId);
  const qty = Math.max(1, Number(quantity) || 1);

  const existing = cart.items.find((x) => String(x.productId) === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({
      productId,
      productName: String(product.productName ?? "Produkt"),
      price: Number(product.price ?? 0),
      vegetarian: Boolean(product.vegetarian),
      quantity: qty,
    });
  }

  setCart(cart);
  return cart;
}

export function updateQuantity(productId, quantity) {
  const cart = getCart();
  const pid = String(productId);
  const q = Number(quantity) || 0;

  const item = cart.items.find((x) => String(x.productId) === pid);
  if (!item) return cart;

  if (q <= 0) {
    cart.items = cart.items.filter((x) => String(x.productId) !== pid);
  } else {
    item.quantity = Math.max(1, Math.floor(q));
  }

  setCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart();
  const pid = String(productId);
  cart.items = cart.items.filter((x) => String(x.productId) !== pid);
  setCart(cart);
  return cart;
}

export function getCartTotal() {
  const cart = getCart();
  return cart.items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );
}

export function getCartCount() {
  const cart = getCart();
  return cart.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
}