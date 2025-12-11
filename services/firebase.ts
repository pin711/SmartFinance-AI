import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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
let authInstance: firebase.auth.Auth;
let dbInstance: firebase.firestore.Firestore;

if (isFirebaseConfigured) {
  try {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.apps[0];
    }
    authInstance = firebase.auth();
    dbInstance = firebase.firestore();
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export const auth = authInstance!;
export const db = dbInstance!;
export { firebase };
