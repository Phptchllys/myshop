import {
  collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

const MAX_QTY = 10

export async function checkIsAdmin(user) {
  if (!user) return false
  try {
    const snapshot = await getDoc(doc(db, 'admins', user.uid))
    return snapshot.exists()
  } catch {
    return false
  }
}

export async function saveProduct(id, data) {
  const ref = id ? doc(db, 'products', id) : doc(collection(db, 'products'))
  await setDoc(ref, data)
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id))
}

export async function getAllOrders() {
  const snapshot = await getDocs(collection(db, 'orders'))
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

export async function updateOrderStatus(id, status) {
  await updateDoc(doc(db, 'orders', id), { status })
}

export function checkOrder(order, productMap) {
  const problems = []
  let expected = 0
  const items = Array.isArray(order.items) ? order.items : []

  for (const item of items) {
    const label = item?.name ?? 'ไม่ทราบชื่อ'
    const qty = item?.qty
    const p = productMap.get(item?.productId)

    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      problems.push(`จำนวนของ "${label}" ผิดปกติ`)
      continue
    }
    if (!p) {
      problems.push(`ไม่พบสินค้า "${label}" ในร้านแล้ว (อาจถูกลบ)`)
      continue
    }

    expected += p.price * qty

    if (item.price !== p.price) {
      problems.push(`ราคา "${label}" ในออเดอร์ (${item.price}) ต่างจากราคาปัจจุบัน (${p.price})`)
    }
  }

  if (Math.abs(expected - order.total) > 0.001) {
    problems.push(`ยอดรวมในออเดอร์ (${order.total}) ไม่ตรงกับที่คำนวณ (${expected})`)
  }

  return { expected, problems }
}