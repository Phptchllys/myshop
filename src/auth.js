import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase.js'

const ERRORS = {
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้สมัครแล้ว',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/weak-password': 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/too-many-requests': 'ลองหลายครั้งเกินไป กรุณารอสักครู่',
  'auth/network-request-failed': 'เชื่อมต่ออินเทอร์เน็ตไม่ได้',
}

export function errorMessage(error) {
  return ERRORS[error.code] ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'
}

export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  return cred.user
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logout() {
  return signOut(auth)
}

export function onUser(callback) {
  return onAuthStateChanged(auth, callback)
}

export function waitForUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}