import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"

// Firebase configuration from user
export const firebaseConfig = {
  apiKey: "AIzaSyA4msCZTiyyaiXLzC1RabFk_QfLSGhT29Y",
  authDomain: "sistema-solo-leveling-6a9d6.firebaseapp.com",
  projectId: "sistema-solo-leveling-6a9d6",
  storageBucket: "sistema-solo-leveling-6a9d6.firebasestorage.app",
  messagingSenderId: "885500518217",
  appId: "1:885500518217:web:0aea0fffe3b36af2c3c498",
  measurementId: "G-EC1RBNJFP2"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export services
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

// Initialize Analytics conditionally (only in browser)
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null
