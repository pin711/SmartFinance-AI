import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// DEFAULT PLACEHOLDER CONFIGURATION
// You must replace these values with your actual Firebase project configuration
// Get these from: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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