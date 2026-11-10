import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase.js'

export async function getProducts(category) {
  const ref = collection(db, 'products')
  const q = category ? query(ref, where('category', '==', category)) : ref
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getProduct(id) {
  const snapshot = await getDoc(doc(db, 'products', id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}