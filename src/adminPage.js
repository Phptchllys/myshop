import './style.css'
import { renderHeader } from './header.js'
import { waitForUser } from './auth.js'
import { getProducts } from './products.js'
import { formatPrice, formatDate, escapeHtml } from './ui.js'
import {
  checkIsAdmin, saveProduct, deleteProduct,
  getAllOrders, updateOrderStatus, checkOrder,
} from './adminApi.js'

renderHeader()

const root = document.querySelector('#admin-root')

const STATUS = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  shipped: 'จัดส่งแล้ว',
  cancelled: 'ยกเลิก',
}

const state = {
  tab: 'orders',
  products: [],
  orders: [],
  editingId: null,
  message: null,
}

async function guard(task, okText) {
  try {
    await task()
    state.message = { type: 'ok', text: okText }
  } catch (error) {
    console.error(error)
    state.message = { type: 'error', text: 'ทำรายการไม่สำเร็จ ดูรายละเอียดใน Console' }
  }
  render()
}

function messageHtml() {
  if (!state.message) return ''
  const { type, text } = state.message
  return `<p class="flash flash-${type}" role="status">${escapeHtml(text)}</p>`
}

function orderCard(o, productMap) {
  const { expected, problems } = checkOrder(o, productMap)

  const items = (Array.isArray(o.items) ? o.items : []).map((i) => `
    <div class="sum-row">
      <span>${escapeHtml(i.name)}${i.color ? ` (${escapeHtml(i.color)})` : ''} × ${escapeHtml(i.qty)}</span>
      <span>${escapeHtml(i.price)} ฿ / ชิ้น</span>
    </div>
  `).join('')

  const warning = problems.length
    ? `<ul class="warn">${problems.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
    : '<p class="ok">✓ ยอดตรงกับราคาปัจจุบัน</p>'

  const options = Object.entries(STATUS).map(([value, label]) =>
    `<option value="${value}" ${o.status === value ? 'selected' : ''}>${label}</option>`
  ).join('')

  return `
    <article class="order-card ${problems.length ? 'has-warn' : ''}">
      <div class="order-head">
        <strong>#${escapeHtml(o.id.slice(0, 8).toUpperCase())}</strong>
        <select data-action="status" data-id="${escapeHtml(o.id)}">${options}</select>
      </div>
      <p class="order-date">${formatDate(o.createdAt)} · ${escapeHtml(o.email)}</p>
      ${items}
      <div class="sum-row"><span>ยอดในออเดอร์</span><span>${formatPrice(o.total)}</span></div>
      <div class="sum-row total"><span>ยอดที่ต้องโอน (คำนวณใหม่)</span><span>${formatPrice(expected)}</span></div>
      ${warning}
      <p class="order-ship">${escapeHtml(o.shipping?.name)} · ${escapeHtml(o.shipping?.phone)}<br>${escapeHtml(o.shipping?.address)}</p>
    </article>
  `
}

function ordersTab() {
  if (state.orders.length === 0) return '<p>ยังไม่มีคำสั่งซื้อ</p>'
  const productMap = new Map(state.products.map((p) => [p.id, p]))
  return state.orders.map((o) => orderCard(o, productMap)).join('')
}

function productForm() {
  const isNew = state.editingId === 'new'
  const p = isNew ? {} : (state.products.find((x) => x.id === state.editingId) ?? {})

  const categoryOptions = ['man', 'woman'].map((c) =>
    `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c.toUpperCase()}</option>`
  ).join('')

  return `
    <form id="product-form" class="form admin-form" novalidate>
      <h3>${isNew ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}</h3>
      <label>ชื่อสินค้า
        <input name="name" maxlength="100" value="${escapeHtml(p.name)}" />
      </label>
      <label>ราคา (บาท)
        <input name="price" type="number" min="0" step="1" value="${escapeHtml(p.price)}" />
      </label>
      <label>หมวดหมู่
        <select name="category">${categoryOptions}</select>
      </label>
      <label>สี (คั่นด้วยเครื่องหมายจุลภาค)
        <input name="colors" value="${escapeHtml((p.colors ?? []).join(', '))}" />
      </label>
      <label>ลิงก์รูป (https://... หรือ /images/tee.jpg)
        <input name="image" value="${escapeHtml(p.image)}" />
      </label>
      <label class="check">
        <input name="soldOut" type="checkbox" ${p.soldOut ? 'checked' : ''} /> สินค้าหมด
      </label>
      <p class="form-error" role="alert"></p>
      <div class="form-actions">
        <button class="btn" type="submit">บันทึก</button>
        <button class="link-btn" type="button" data-action="cancel-edit">ยกเลิก</button>
      </div>
    </form>
  `
}

function productRows() {
  if (state.products.length === 0) return '<p>ยังไม่มีสินค้า</p>'
  return state.products.map((p) => `
    <div class="admin-row">
      <img src="${escapeHtml(p.image)}" alt="" />
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <p class="colors">${formatPrice(p.price)} · ${escapeHtml(p.category)}${p.soldOut ? ' · หมด' : ''}</p>
      </div>
      <button class="link-btn" data-action="edit" data-id="${escapeHtml(p.id)}">แก้ไข</button>
      <button class="link-btn" data-action="delete" data-id="${escapeHtml(p.id)}">ลบ</button>
    </div>
  `).join('')
}

function productsTab() {
  return `
    ${state.editingId ? productForm() : '<button class="btn" data-action="new">+ เพิ่มสินค้า</button>'}
    <div class="admin-list">${productRows()}</div>
  `
}

function render() {
  const tabBtn = (name, label) =>
    `<button class="tab ${state.tab === name ? 'active' : ''}" data-action="tab" data-tab="${name}">${label}</button>`

  root.innerHTML = `
    <div class="tabs">
      ${tabBtn('orders', `ออเดอร์ (${state.orders.length})`)}
      ${tabBtn('products', `สินค้า (${state.products.length})`)}
    </div>
    ${messageHtml()}
    ${state.tab === 'orders' ? ordersTab() : productsTab()}
  `
}

function readProductForm(data) {
  const name = String(data.name ?? '').trim()
  const priceText = String(data.price ?? '').trim()
  const price = Number(priceText)
  const category = String(data.category ?? '')
  const image = String(data.image ?? '').trim()
  const colors = String(data.colors ?? '').split(',').map((c) => c.trim()).filter(Boolean)

  if (name.length < 1 || name.length > 100) return { error: 'ชื่อสินค้าต้องยาว 1–100 ตัวอักษร' }
  if (priceText === '' || !Number.isFinite(price) || price < 0 || price > 1000000) {
    return { error: 'ราคาไม่ถูกต้อง' }
  }
  if (!['man', 'woman'].includes(category)) return { error: 'กรุณาเลือกหมวดหมู่' }
  if (!/^(https:\/\/|\/)/.test(image) || image.length > 500) {
    return { error: 'ลิงก์รูปต้องขึ้นต้นด้วย https:// หรือ /' }
  }
  if (colors.length > 20 || colors.some((c) => c.length > 30)) {
    return { error: 'สีมากเกินไป หรือชื่อสียาวเกินไป' }
  }

  return { product: { name, price, category, colors, image, soldOut: data.soldOut === 'on' } }
}

root.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]')
  if (!btn) return

  const { action, id, tab } = btn.dataset
  state.message = null

  if (action === 'tab') { state.tab = tab; state.editingId = null; render(); return }
  if (action === 'new') { state.editingId = 'new'; render(); return }
  if (action === 'edit') { state.editingId = id; render(); return }
  if (action === 'cancel-edit') { state.editingId = null; render(); return }

  if (action === 'delete') {
    const p = state.products.find((x) => x.id === id)
    if (!p || !window.confirm(`ลบ "${p.name}" ถาวร?`)) return
    await guard(async () => {
      await deleteProduct(id)
      state.products = await getProducts()
    }, 'ลบสินค้าแล้ว')
  }
})

root.addEventListener('change', async (e) => {
  const select = e.target.closest('select[data-action="status"]')
  if (!select) return

  const { id } = select.dataset
  const status = select.value
  state.message = null

  await guard(async () => {
    await updateOrderStatus(id, status)
    const order = state.orders.find((o) => o.id === id)
    if (order) order.status = status
  }, 'อัปเดตสถานะแล้ว')
})

root.addEventListener('submit', async (e) => {
  if (e.target.id !== 'product-form') return
  e.preventDefault()

  const form = e.target
  const errorEl = form.querySelector('.form-error')
  const { error, product } = readProductForm(Object.fromEntries(new FormData(form)))

  if (error) {
    errorEl.textContent = error
    return
  }

  form.querySelector('button[type="submit"]').disabled = true
  const id = state.editingId === 'new' ? null : state.editingId

  await guard(async () => {
    await saveProduct(id, product)
    state.products = await getProducts()
    state.editingId = null
  }, 'บันทึกสินค้าแล้ว')
})

async function init() {
  root.innerHTML = '<p>กำลังโหลด...</p>'

  const user = await waitForUser()
  if (!user) {
    window.location.href = '/login.html?next=/admin.html'
    return
  }

  if (!(await checkIsAdmin(user))) {
    root.innerHTML = '<p>บัญชีนี้ไม่มีสิทธิ์เข้าหน้านี้</p><a class="btn-link" href="/">กลับหน้าแรก</a>'
    return
  }

  try {
    const [products, orders] = await Promise.all([getProducts(), getAllOrders()])
    state.products = products
    state.orders = orders
    render()
  } catch (error) {
    console.error(error)
    root.innerHTML = '<p>โหลดข้อมูลไม่สำเร็จ</p>'
  }
}

init()