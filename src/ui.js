export function formatPrice(n) {
  return n.toLocaleString('th-TH') + ' ฿'
}

export function productCard(p) {
  const colorText = p.colors && p.colors.length > 1
    ? `<p class="colors">Available in ${p.colors.length} colors</p>`
    : ''

  return `
    <a class="card-link" href="/product.html?id=${p.id}">
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