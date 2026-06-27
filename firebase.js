// src/lib/firebase.js
// Replace these values with your Firebase project config
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:000:web:000",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signUpWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const logOut = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
export const updateUserProfile = (user, data) => updateProfile(user, data);

// Firestore helpers
export const saveSimulation = async (userId, simulation) => {
  const ref = collection(db, "simulations");
  return addDoc(ref, {
    ...simulation,
    userId,
    createdAt: serverTimestamp(),
  });
};

export const getUserSimulations = async (userId) => {
  const ref = collection(db, "simulations");
  const q = query(ref, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteSimulation = async (id) => {
  await deleteDoc(doc(db, "simulations", id));
};

export const updateSimulation = async (id, data) => {
  await updateDoc(doc(db, "simulations", id), data);
};
