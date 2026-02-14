import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, where, Timestamp, setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdwg7_5RHfZPVobrwu_Fm9Jf5VP2Ozwhk",
  authDomain: "yclone-portfolio.firebaseapp.com",
  projectId: "yclone-portfolio",
  messagingSenderId: "1089517858088",
  appId: "1:1089517858088:web:872d10b50e1178d03e341d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Export functions for use in other files
export { 
    collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, where, Timestamp, setDoc,
    signInWithEmailAndPassword, onAuthStateChanged, signOut 
};