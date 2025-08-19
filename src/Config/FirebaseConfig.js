import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi5qQUF53QP3c0vzn0dun-p2sBtPOcsNs",
  authDomain: "digitallocker-3e853.firebaseapp.com",
  projectId: "digitallocker-3e853",
  storageBucket: "digitallocker-3e853.appspot.com",
  messagingSenderId: "1062488302030",
  appId: "1:1062488302030:web:a3f4b3d333509084648b9f",
  measurementId: "G-3FJMFRNNP5",
};

// Initialize Firebase
const firebase_app = initializeApp(firebaseConfig);
export const firestore_db = getFirestore(firebase_app);
export default firebase_app;
