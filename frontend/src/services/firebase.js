import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBq99Zf7hNQPEP4rQnuGz-BnsN2uhtphFE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "e-dector.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "e-dector",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "e-dector.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "49867082620",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:49867082620:web:4da5db36ba320afbce32f9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
