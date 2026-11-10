const KEY = 'myshop-cart'
const MAX_QTY = 10

export function getCart() {
  try {
    const raw = localStorage.getItem(KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-changed'))
}

function isSame(item, productId, color) {
  return item.productId === productId && item.color === color
}

export function addToCart(productId, color = '', qty = 1) {
  const cart = getCart()
  const existing = cart.find((i) => isSame(i, productId, color))

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, MAX_QTY)
  } else {
    cart.push({ productId, color, qty: Math.min(qty, MAX_QTY) })
  }
  saveCart(cart)
}

export function setQty(productId, color, qty) {
  let cart = getCart()

  if (qty <= 0) {
    cart = cart.filter((i) => !isSame(i, productId, color))
  } else {
    const item = cart.find((i) => isSame(i, productId, color))
    if (item) item.qty = Math.min(qty, MAX_QTY)
  }
  saveCart(cart)
}

export function removeItem(productId, color) {
  saveCart(getCart().filter((i) => !isSame(i, productId, color)))
}

export function clearCart() {
  saveCart([])
}

export function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0)
}