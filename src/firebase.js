import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBBVwAoHNOkH6WTFzAVjveswyKY1KaPVhU",
  authDomain: "myshop-afa7c.firebaseapp.com",
  projectId: "myshop-afa7c",
  storageBucket: "myshop-afa7c.firebasestorage.app",
  messagingSenderId: "106757294347",
  appId: "1:106757294347:web:02b314de31d02623b77a0e",
  measurementId: "G-MRBGTQJ5YV"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)