import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'


const products = [
  { id: 'p1', name: 'Basic Tee', price: 199, soldOut: false, category: 'man',
    colors: ['Black', 'White', 'Navy'],
    image: 'https://placehold.co/400x500?text=Basic+Tee' },
  { id: 'p2', name: 'Work Jacket', price: 699, soldOut: false, category: 'man',
    colors: ['Black', 'Brown'],
    image: 'https://placehold.co/400x500?text=Work+Jacket' },
  { id: 'p3', name: 'Denim Cap', price: 299, soldOut: true, category: 'man',
    colors: ['Black'],
    image: 'https://placehold.co/400x500?text=Denim+Cap' },
  { id: 'p4', name: 'Lounge Sweatpants', price: 599, soldOut: false, category: 'woman',
    colors: ['Gray', 'Black'],
    image: 'https://placehold.co/400x500?text=Sweatpants' },
  { id: 'p5', name: 'Cotton Hoodie', price: 699, soldOut: false, category: 'woman',
    colors: ['Cream', 'Black'],
    image: 'https://placehold.co/400x500?text=Hoodie' },
  { id: 'p6', name: 'Silk Tie', price: 299, soldOut: true, category: 'man',
    colors: ['Black', 'Gray'],
    image: 'https://placehold.co/400x500?text=Silk+Tie' },
]

export async function seedProducts() {
  for (const p of products) {
    const { id, ...data } = p
    await setDoc(doc(db, 'products', id), data)
    console.log('บันทึกแล้ว:', id)
  }
  console.log('เสร็จทั้งหมด')
}