import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCq0OxliLM4b6i-6QRyNYgJtlElawCoeOU",
  authDomain: "apex-ai-a323f.firebaseapp.com",
  projectId: "apex-ai-a323f",
  storageBucket: "apex-ai-a323f.firebasestorage.app",
  messagingSenderId: "1024915479428",
  appId: "1:1024915479428:web:67061babface72020c5bd1",
  measurementId: "G-J5B6HWWTPD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
