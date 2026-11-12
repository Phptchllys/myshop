import './style.css'
import { renderHeader } from './header.js'
import { login, register, errorMessage } from './auth.js'

renderHeader()

const form = document.querySelector('#auth-form')
const title = document.querySelector('#auth-title')
const nameField = document.querySelector('#name-field')
const submit = document.querySelector('#auth-submit')
const errorEl = document.querySelector('#auth-error')
const switchText = document.querySelector('#switch-text')
const switchBtn = document.querySelector('#switch-btn')

let mode = 'login'

function setMode(next) {
  mode = next
  const isLogin = mode === 'login'
  title.textContent = isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
  submit.textContent = isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
  nameField.hidden = isLogin
  switchText.textContent = isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'
  switchBtn.textContent = isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'
  errorEl.textContent = ''
}

function nextUrl() {
  const next = new URLSearchParams(window.location.search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorEl.textContent = ''

  const data = Object.fromEntries(new FormData(form))
  const name = String(data.name ?? '').trim()
  const email = String(data.email ?? '').trim()
  const password = String(data.password ?? '')

  if (!email || !password) {
    errorEl.textContent = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  if (mode === 'register' && !name) {
    errorEl.textContent = 'กรุณากรอกชื่อ'
    return
  }

  submit.disabled = true
  try {
    if (mode === 'login') await login(email, password)
    else await register(name, email, password)
    window.location.href = nextUrl()
  } catch (error) {
    console.error(error)
    errorEl.textContent = errorMessage(error)
  } finally {
    submit.disabled = false
  }
})

switchBtn.addEventListener('click', () => {
  setMode(mode === 'login' ? 'register' : 'login')
})