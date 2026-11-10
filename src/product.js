import './style.css'
import { getProduct } from './products.js'
import { formatPrice } from './ui.js'

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

    root.innerHTML = `
      <div class="detail-img">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="detail-info">
        <h1>${p.name}</h1>
        <p class="price">${formatPrice(p.price)}</p>
        <p class="colors">สี: ${(p.colors ?? []).join(', ')}</p>
        <button class="btn" ${p.soldOut ? 'disabled' : ''}>
          ${p.soldOut ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
        </button>
      </div>
    `
  } catch (error) {
    console.error('โหลดสินค้าไม่สำเร็จ:', error)
    root.innerHTML = '<p>โหลดสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง</p>'
  }
}

loadProduct()