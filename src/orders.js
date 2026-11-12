import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db, auth } from './firebase.js'
import { getProduct } from './products.js'
import { getCart } from './cart.js'

const MAX_QTY = 10

export class OrderError extends Error {}

export async function prepareOrder() {
  if (!auth.currentUser) throw new OrderError('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ')

  const cart = getCart()
  if (cart.length === 0) throw new OrderError('ตะกร้าว่างเปล่า')

  const ids = [...new Set(cart.map((i) => i.productId))]
  const found = await Promise.all(ids.map((id) => getProduct(id)))
  const products = new Map(ids.map((id, index) => [id, found[index]]))

  const items = cart.map((item) => {
    const p = products.get(item.productId)

    if (!p || p.soldOut) {
      throw new OrderError(`สินค้า "${p ? p.name : 'บางรายการ'}" ไม่มีจำหน่ายแล้ว กรุณาลบออกจากตะกร้า`)
    }
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > MAX_QTY) {
      throw new OrderError('จำนวนสินค้าในตะกร้าไม่ถูกต้อง')
    }
    if (p.colors?.length && !p.colors.includes(item.color)) {
      throw new OrderError(`สีของ "${p.name}" ไม่ถูกต้อง`)
    }

    return { productId: p.id, name: p.name, color: item.color, qty: item.qty, price: p.price }
  })

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  return { items, total }
}

export async function createOrder(shipping) {
  const { items, total } = await prepareOrder()
  const user = auth.currentUser

  const ref = await addDoc(collection(db, 'orders'), {
    userId: user.uid,
    email: user.email,
    items,
    total,
    shipping,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getMyOrders() {
  const user = auth.currentUser
  if (!user) return []

  const q = query(collection(db, 'orders'), where('userId', '==', user.uid))
  const snapshot = await getDocs(q)

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}