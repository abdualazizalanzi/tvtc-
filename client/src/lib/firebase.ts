// Firebase Client Configuration
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCn-8hbJENLTGM8874U2tSsdkrcr0ip67k",
  authDomain: "tvtc-763fd.firebaseapp.com",
  projectId: "tvtc-763fd",
  storageBucket: "tvtc-763fd.firebasestorage.app",
  messagingSenderId: "661475702519",
  appId: "1:661475702519:web:d2beb07fcf7c2956ea45f2",
  measurementId: "G-Q3ZPBWXWQ3"
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

// Initialize Firebase with safety check
function initializeFirebase() {
  if (typeof window === "undefined") {
    console.log("🔥 Firebase skipped (server-side)");
    return;
  }
  
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("🔥 Firebase Client Initialized");
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics (only in production or when not in development)
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("🔥 Firebase initialization error:", error);
  }
}

// Run initialization
initializeFirebase();

// Export with fallbacks to prevent "onAuthStateChanged" errors
export { app, auth, db, analytics, firebaseOnAuthStateChanged };
export default app;

