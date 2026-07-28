import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCq0OxliLM4b6i-6QRyNYgJtlElawCoeOU",
  authDomain: "apex-ai-a323f.firebaseapp.com",
  projectId: "apex-ai-a323f",
  storageBucket: "apex-ai-a323f.firebasestorage.app",
  messagingSenderId: "1024915479428",
  appId: "1:1024915479428:web:67061babface72020c5bd1",
  measurementId: "G-J5B6HWWTPD",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Erreur de connexion Google:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
export default app;
