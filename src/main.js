import './style.css'
import { getProducts } from './products.js'
import { productCard } from './ui.js'

const grid = document.querySelector('#product-grid')
const searchInput = document.querySelector('#search')
const titleEl = document.querySelector('.section-title')

const category = new URLSearchParams(window.location.search).get('category')
const titles = { man: 'MAN', woman: 'WOMAN' }
titleEl.textContent = titles[category] ?? 'NEW ARRIVALS'

let allProducts = []

function render(list) {
  if (list.length === 0) {
    grid.innerHTML = '<p>ไม่พบสินค้า</p>'
    return
  }
  grid.innerHTML = list.map(productCard).join('')
}

async function loadProducts() {
  grid.innerHTML = '<p>กำลังโหลดสินค้า...</p>'
  try {
    allProducts = await getProducts(category)
    render(allProducts)
  } catch (error) {
    console.error('โหลดสินค้าไม่สำเร็จ:', error)
    grid.innerHTML = '<p>โหลดสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง</p>'
  }
}

searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.trim().toLowerCase()
  const result = allProducts.filter((p) => p.name.toLowerCase().includes(keyword))
  render(result)
})

loadProducts()