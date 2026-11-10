import './style.css'
import { getProduct } from './products.js'
import { formatPrice } from './ui.js'
import { renderHeader } from './header.js'
import { addToCart } from './cart.js'

renderHeader()

const root = document.querySelector('#product-detail')
const id = new URLSearchParams(window.location.search).get('id')

async function loadProduct() {
  if (!id) {
    root.innerHTML = '<p>ไม่พบสินค้า</p>'
    return
  }

  root.innerHTML = '<p>กำลังโหลด...</p>'

  try {
    const p = await getProduct(id)

    if (!p) {
      root.innerHTML = '<p>ไม่พบสินค้านี้</p>'
      return
    }

    document.title = `${p.name} | MYSHOP`

    const colors = p.colors ?? []
    let selectedColor = colors[0] ?? ''

    const colorHtml = colors.length
      ? `<p class="label">สี</p>
         <div class="color-options">
           ${colors.map((c) => `<button type="button" class="color-btn" data-color="${c}">${c}</button>`).join('')}
         </div>`
      : ''

    root.innerHTML = `
      <div class="detail-img">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="detail-info">
        <h1>${p.name}</h1>
        <p class="price">${formatPrice(p.price)}</p>
        ${colorHtml}
        <button id="add-btn" class="btn" ${p.soldOut ? 'disabled' : ''}>
          ${p.soldOut ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
        </button>
        <p id="add-msg" class="add-msg"></p>
      </div>
    `

    const colorBtns = root.querySelectorAll('.color-btn')
    const addBtn = root.querySelector('#add-btn')
    const msg = root.querySelector('#add-msg')

    function selectColor(color) {
      selectedColor = color
      colorBtns.forEach((b) => {
        b.classList.toggle('selected', b.dataset.color === color)
      })
    }

    colorBtns.forEach((b) => {
      b.addEventListener('click', () => selectColor(b.dataset.color))
    })
    selectColor(selectedColor)

    addBtn.addEventListener('click', () => {
      addToCart(p.id, selectedColor)
      msg.innerHTML = 'เพิ่มลงตะกร้าแล้ว ✓ <a href="/cart.html">ดูตะกร้า</a>'
    })
  } catch (error) {
    console.error('โหลดสินค้าไม่สำเร็จ:', error)
    root.innerHTML = '<p>โหลดสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง</p>'
  }
}

loadProduct()