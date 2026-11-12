export function formatPrice(n) {
  return n.toLocaleString('th-TH') + ' ฿'
}

export function productCard(p, index = 0) {
  const colorText = p.colors && p.colors.length > 1
    ? `<p class="colors">Available in ${p.colors.length} colors</p>`
    : ''

    
  return `
    <a class="card-link" href="/product.html?id=${p.id}" style="--i:${index}">
      <article class="card">
        <div class="card-img">
          <img src="${p.image}" alt="${p.name}" />
          ${p.soldOut ? '<span class="badge">Sold out</span>' : ''}
        </div>
        <h3>${p.name}</h3>
        <p class="price">${formatPrice(p.price)}</p>
        ${colorText}
      </article>
    </a>
  `
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function formatDate(ts) {
  if (!ts) return ''
  return ts.toDate().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
  
}

export function skeletonCards(n = 8) {
  return Array.from({ length: n }, () => `
    <div class="sk-card" aria-hidden="true">
      <div class="skeleton sk-img"></div>
      <div class="skeleton sk-line"></div>
      <div class="skeleton sk-line short"></div>
    </div>
  `).join('')
}