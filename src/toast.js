let container = null

function getContainer() {
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    container.setAttribute('role', 'status')
    container.setAttribute('aria-live', 'polite')
    document.body.append(container)
  }
  return container
}

export function showToast(message, { duration = 2500 } = {}) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = message
  getContainer().append(el)

  setTimeout(() => {
    el.classList.add('hide')
    setTimeout(() => el.remove(), 300)
  }, duration)
}