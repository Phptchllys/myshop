import './style.css'
import { getProduct } from './products.js'
import { formatPrice } from './ui.js'
import { renderHeader } from './header.js'
import { getCart, setQty, removeItem } from './cart.js'

renderHeader()

const root = document.querySelector('#cart-root')
const productCache = new Map()

async function loadProductsForCart(cart) {
  const ids = [...new Set(cart.map((i) => i.productId))]
  const missing = ids.filter((id) => !productCache.has(id))
  const results = await Promise.all(missing.map((id) => getProduct(id)))
  missing.forEach((id, index) => productCache.set(id, results[index]))
}

function render() {
  const cart = getCart()

  if (cart.length === 0) {
    root.innerHTML = `
      <p>ตะกร้าของคุณว่างเปล่า</p>
      <a class="btn-link" href="/">เลือกซื้อสินค้า</a>
    `
    return
  }

  const total = cart.reduce((sum, item) => {
    const p = productCache.get(item.productId)
    return p && !p.soldOut ? sum + p.price * item.qty : sum
  }, 0)

  const rows = cart.map((item) => {
    const p = productCache.get(item.productId)
    const key = `data-id="${item.productId}" data-color="${item.color}"`

    if (!p || p.soldOut) {
      const name = p ? p.name : 'สินค้านี้'
      return `
        <div class="cart-row unavailable">
          <p>${name}${item.color ? ` (${item.color})` : ''} ไม่มีจำหน่ายในขณะนี้</p>
          <button class="link-btn" data-action="remove" ${key}>ลบ</button>
        </div>
      `
    }

    return `
      <div class="cart-row">
        <img src="${p.image}" alt="${p.name}" />
        <div class="cart-info">
          <a href="/product.html?id=${p.id}">${p.name}</a>
          ${item.color ? `<p class="colors">สี: ${item.color}</p>` : ''}
          <p class="price">${formatPrice(p.price)}</p>
        </div>
        <div class="qty">
          <button data-action="dec" ${key}>−</button>
          <span>${item.qty}</span>
          <button data-action="inc" ${key}>+</button>
        </div>
        <div class="line-total">${formatPrice(p.price * item.qty)}</div>
        <button class="link-btn" data-action="remove" ${key}>ลบ</button>
      </div>
    `
  })

  root.innerHTML = `
    <div class="cart-list">${rows.join('')}</div>
    <div class="cart-summary">
      <p>ค่าจัดส่ง: ฟรี</p>
      <p class="total">รวมทั้งหมด: ${formatPrice(total)}</p>
      <button class="btn" id="checkout-btn">ดำเนินการสั่งซื้อ</button>
    </div>
  `
}

root.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]')
  if (!btn) return

  const { action, id, color } = btn.dataset
  const item = getCart().find((i) => i.productId === id && i.color === color)

  if (action === 'inc' && item) setQty(id, color, item.qty + 1)
  if (action === 'dec' && item) setQty(id, color, item.qty - 1)
  if (action === 'remove') removeItem(id, color)

  render()
})

async function init() {
  root.innerHTML = '<p>กำลังโหลดตะกร้า...</p>'
  try {
    await loadProductsForCart(getCart())
    render()
  } catch (error) {
    console.error('โหลดตะกร้าไม่สำเร็จ:', error)
    root.innerHTML = '<p>โหลดตะกร้าไม่สำเร็จ ลองใหม่อีกครั้ง</p>'
  }
}

init()