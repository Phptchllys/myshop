import { cartCount } from './cart.js'

function updateCartCount() {
  const span = document.querySelector('#cart-count')
  if (span) span.textContent = cartCount()
}

export function renderHeader() {
  const el = document.querySelector('#site-header')
  if (!el) return

  el.innerHTML = `
    <div class="announce">ส่งฟรี! ไม่มีขั้นต่ำ</div>
    <header class="topbar">
      <a href="/" class="logo">MYSHOP</a>
      <nav>
        <a href="/?category=man">MAN</a>
        <a href="/?category=woman">WOMAN</a>
        <a href="/">SHOP</a>
      </nav>
      <a href="/cart.html" class="cart">ตะกร้า (<span id="cart-count">0</span>)</a>
    </header>
  `

  updateCartCount()
  window.addEventListener('cart-changed', updateCartCount)
  window.addEventListener('storage', updateCartCount)
}