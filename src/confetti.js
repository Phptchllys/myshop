import { reducedMotion } from './motion.js'

const COLORS = ['#111111', '#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#ffd166']

export function confetti(count = 120) {
  if (reducedMotion()) return

  const canvas = document.createElement('canvas')
  canvas.className = 'confetti'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.append(canvas)

  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pieces = Array.from({ length: count }, () => ({
    x: w / 2,
    y: h * 0.6,
    vx: (Math.random() - 0.5) * 16,
    vy: -(Math.random() * 12 + 6),
    size: Math.random() * 6 + 6,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))

  let frames = 0

  function tick() {
    ctx.clearRect(0, 0, w, h)
    let alive = 0

    for (const p of pieces) {
      p.vy += 0.35
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.spin
      if (p.y < h + 20) alive++

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }

    frames++
    if (alive > 0 && frames < 400) requestAnimationFrame(tick)
    else canvas.remove()
  }

  requestAnimationFrame(tick)
}