import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// DEFAULT PLACEHOLDER CONFIGURATION
// You must replace these values with your actual Firebase project configuration
// Get these from: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAcptEBJJmCriuLJ99x-IvDFene5LtxrEA",
  authDomain: "abby-47176.firebaseapp.com",
  projectId: "abby-47176",
  storageBucket: "abby-47176.firebasestorage.app",
  messagingSenderId: "411521544714",
  appId: "1:411521544714:web:ba19a8a39c5de44f33e5f3"
};

// Check if the user has updated the config
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("YOUR_API_KEY");

let app;
let authInstance;
let dbInstance;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export const auth = authInstance!;
export const db = dbInstance!;