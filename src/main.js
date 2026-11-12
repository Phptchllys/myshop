import './style.css'
import { getProducts } from './products.js'
import { productCard, skeletonCards } from './ui.js'
import { renderHeader } from './header.js'

renderHeader()

const grid = document.querySelector('#product-grid')
const searchInput = document.querySelector('#search')
const titleEl = document.querySelector('.section-title')
const hero = document.querySelector('.hero')

const category = new URLSearchParams(window.location.search).get('category')
const titles = { man: 'MAN', woman: 'WOMAN' }
titleEl.textContent = titles[category] ?? 'NEW ARRIVALS'

if (hero && category) hero.hidden = true

let allProducts = []

function render(list) {
  if (list.length === 0) {
    grid.innerHTML = '<p>ไม่พบสินค้า</p>'
    return
  }
  grid.innerHTML = list.map(productCard).join('')
}

async function loadProducts() {
  grid.innerHTML = skeletonCards(8)
  try {
    allProducts = await getProducts(category)
    render(allProducts)
    grid.classList.add('intro')
  } catch (error) {
    console.error('โหลดสินค้าไม่สำเร็จ:', error)
    grid.innerHTML = '<p>โหลดสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง</p>'
  }
}

searchInput.addEventListener('input', () => {
  grid.classList.remove('intro')
  const keyword = searchInput.value.trim().toLowerCase()
  const result = allProducts.filter((p) => p.name.toLowerCase().includes(keyword))
  render(result)
})

document.querySelector('#lucky')?.addEventListener('click', () => {
  const available = allProducts.filter((p) => !p.soldOut)
  if (available.length === 0) return

  const pick = available[Math.floor(Math.random() * available.length)]
  window.location.href = `/product.html?id=${encodeURIComponent(pick.id)}`
})

loadProducts()