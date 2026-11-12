import { cartCount } from './cart.js'
import { onUser, logout } from './auth.js'

function updateCartCount() {
  const span = document.querySelector('#cart-count')
  if (span) span.textContent = cartCount()
}

function renderAccount(user) {
  const box = document.querySelector('#account')
  if (!box) return
  box.replaceChildren()

  if (!user) {
    const link = document.createElement('a')
    link.href = '/login.html'
    link.textContent = 'เข้าสู่ระบบ'
    box.append(link)
    return
  }

  const ordersLink = document.createElement('a')
  ordersLink.href = '/orders.html'
  ordersLink.textContent = user.displayName || user.email

  const logoutBtn = document.createElement('button')
  logoutBtn.type = 'button'
  logoutBtn.className = 'link-btn'
  logoutBtn.textContent = 'ออกจากระบบ'
  logoutBtn.addEventListener('click', async () => {
    await logout()
    window.location.href = '/'
  })

  box.append(ordersLink, logoutBtn)
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
      <div class="topbar-right">
        <div id="account" class="account"></div>
        <a href="/cart.html" class="cart">ตะกร้า (<span id="cart-count">0</span>)</a>
      </div>
    </header>
  `

  updateCartCount()
  window.addEventListener('cart-changed', updateCartCount)
  window.addEventListener('storage', updateCartCount)
  onUser(renderAccount)
}