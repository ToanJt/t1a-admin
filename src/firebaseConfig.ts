// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCHClebO1zq03PpZdOGB0AONtTpkKsLriw",
  authDomain: "trungle-b9ef8.firebaseapp.com",
  projectId: "trungle-b9ef8",
  storageBucket: "trungle-b9ef8.appspot.com",
  messagingSenderId: "699186838198",
  appId: "1:699186838198:web:e830773f4d737a00bd0417",
  measurementId: "G-Z7NCEQ45VQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
