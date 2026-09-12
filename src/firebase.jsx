// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA4BqkVDbEjheXECKktSyn4ucaCG1fzJgo",
    authDomain: "to-do-7690c.firebaseapp.com",
    projectId: "to-do-7690c",
    storageBucket: "to-do-7690c.firebasestorage.app",
    messagingSenderId: "595646929013",
    appId: "1:595646929013:web:ee4b1832b1f69785a0803c",
    measurementId: "G-N94444QMTN"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
provider.addScope("profile");
provider.addScope("email");
const analytics = getAnalytics(app);