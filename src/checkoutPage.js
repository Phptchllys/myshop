import './style.css'
import { renderHeader } from './header.js'
import { waitForUser } from './auth.js'
import { prepareOrder, createOrder, OrderError } from './orders.js'
import { getCart, clearCart } from './cart.js'
import { formatPrice, escapeHtml } from './ui.js'

renderHeader()

const root = document.querySelector('#checkout-root')

function validateShipping(data) {
  const name = String(data.name ?? '').trim()
  const phone = String(data.phone ?? '').trim()
  const address = String(data.address ?? '').trim()

  if (name.length < 1 || name.length > 100) return 'กรุณากรอกชื่อ-นามสกุล'
  if (!/^0\d{8,9}$/.test(phone)) return 'เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)'
  if (address.length < 5 || address.length > 300) return 'กรุณากรอกที่อยู่ให้ครบ'
  return ''
}

function render(user, items, total) {
  const rows = items.map((i) => `
    <div class="sum-row">
      <span>${escapeHtml(i.name)}${i.color ? ` (${escapeHtml(i.color)})` : ''} × ${i.qty}</span>
      <span>${formatPrice(i.price * i.qty)}</span>
    </div>
  `).join('')

  root.innerHTML = `
    <div class="checkout-grid">
      <form id="checkout-form" class="form" novalidate>
        <h3>ที่อยู่จัดส่ง</h3>
        <label>ชื่อ-นามสกุล
          <input name="name" value="${escapeHtml(user.displayName)}" maxlength="100" />
        </label>
        <label>เบอร์โทร
          <input name="phone" type="tel" maxlength="10" inputmode="numeric" />
        </label>
        <label>ที่อยู่
          <textarea name="address" rows="4" maxlength="300"></textarea>
        </label>
        <p id="checkout-error" class="form-error" role="alert"></p>
        <button class="btn" type="submit" id="place-btn">ยืนยันการสั่งซื้อ</button>
      </form>

      <aside class="order-summary">
        <h3>สรุปรายการ</h3>
        ${rows}
        <div class="sum-row"><span>ค่าจัดส่ง</span><span>ฟรี</span></div>
        <div class="sum-row total"><span>รวมทั้งหมด</span><span>${formatPrice(total)}</span></div>
      </aside>
    </div>
  `
}

function bindForm() {
  const form = root.querySelector('#checkout-form')
  const errorEl = root.querySelector('#checkout-error')
  const btn = root.querySelector('#place-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errorEl.textContent = ''

    const data = Object.fromEntries(new FormData(form))
    const problem = validateShipping(data)
    if (problem) {
      errorEl.textContent = problem
      return
    }

    btn.disabled = true
    btn.textContent = 'กำลังบันทึก...'

    try {
      const shipping = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
      }
      const orderId = await createOrder(shipping)
      clearCart()
      window.location.href = `/orders.html?new=${orderId}`
    } catch (error) {
      console.error(error)
      errorEl.textContent = error instanceof OrderError
        ? error.message
        : 'สั่งซื้อไม่สำเร็จ ลองใหม่อีกครั้ง'
      btn.disabled = false
      btn.textContent = 'ยืนยันการสั่งซื้อ'
    }
  })
}

async function init() {
  root.innerHTML = '<p>กำลังโหลด...</p>'

  const user = await waitForUser()
  if (!user) {
    window.location.href = '/login.html?next=/checkout.html'
    return
  }

  if (getCart().length === 0) {
    root.innerHTML = '<p>ตะกร้าว่างเปล่า</p><a class="btn-link" href="/">เลือกซื้อสินค้า</a>'
    return
  }

  try {
    const { items, total } = await prepareOrder()
    render(user, items, total)
    bindForm()
  } catch (error) {
    console.error(error)
    const text = error instanceof OrderError ? escapeHtml(error.message) : 'โหลดข้อมูลไม่สำเร็จ'
    root.innerHTML = `<p>${text}</p><a class="btn-link" href="/cart.html">กลับไปตะกร้า</a>`
  }
}

init()