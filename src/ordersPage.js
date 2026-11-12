import './style.css'
import { renderHeader } from './header.js'
import { waitForUser } from './auth.js'
import { getMyOrders } from './orders.js'
import { formatPrice, formatDate, escapeHtml } from './ui.js'
import { confetti } from './confetti.js'

renderHeader()

const root = document.querySelector('#orders-root')
const newId = new URLSearchParams(window.location.search).get('new')

const STATUS = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  shipped: 'จัดส่งแล้ว',
  cancelled: 'ยกเลิก',
}

function orderCard(o) {
  const items = o.items.map((i) => `
    <div class="sum-row">
      <span>${escapeHtml(i.name)}${i.color ? ` (${escapeHtml(i.color)})` : ''} × ${i.qty}</span>
      <span>${formatPrice(i.price * i.qty)}</span>
    </div>
  `).join('')

  return `
    <article class="order-card">
      <div class="order-head">
        <strong>#${escapeHtml(o.id.slice(0, 8).toUpperCase())}</strong>
        <span class="status status-${escapeHtml(o.status)}">${escapeHtml(STATUS[o.status] ?? o.status)}</span>
      </div>
      <p class="order-date">${formatDate(o.createdAt)}</p>
      ${items}
      <div class="sum-row total"><span>รวม</span><span>${formatPrice(o.total)}</span></div>
      <p class="order-ship">${escapeHtml(o.shipping.name)} · ${escapeHtml(o.shipping.phone)}<br>${escapeHtml(o.shipping.address)}</p>
    </article>
  `
}

function banner() {
      if (newId) {
      confetti()
      history.replaceState(null, '', window.location.pathname)
    }
  return `
    <div class="banner">
      <strong>สั่งซื้อสำเร็จ!</strong> หมายเลขคำสั่งซื้อ #${escapeHtml(newId.slice(0, 8).toUpperCase())}<br>
      กรุณาโอนเงินตามยอดรวม แล้วส่งสลิปแจ้งร้านทางช่องทางที่ร้านกำหนด
      (แก้ข้อความส่วนนี้เป็นเลขบัญชีหรือ LINE ของร้านคุณ)
    </div>
  `
}

async function init() {
  root.innerHTML = '<p>กำลังโหลด...</p>'

  const user = await waitForUser()
  if (!user) {
    window.location.href = '/login.html?next=/orders.html'
    return
  }

  try {
    const orders = await getMyOrders()
    root.innerHTML = banner() + (
      orders.length === 0
        ? '<p>ยังไม่มีคำสั่งซื้อ</p>'
        : orders.map(orderCard).join('')
    )
  } catch (error) {
    console.error('โหลดคำสั่งซื้อไม่สำเร็จ:', error)
    root.innerHTML = '<p>โหลดคำสั่งซื้อไม่สำเร็จ ลองใหม่อีกครั้ง</p>'
  }
}

init()