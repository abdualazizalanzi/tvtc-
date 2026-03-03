// Firebase Firestore Database Configuration
import { initializeApp, getApps, FirebaseApp, cert, getApps as getAdminApps } from "firebase-admin/app";
import { getFirestore, Firestore, CollectionReference, DocumentData } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Firebase Admin Configuration
let adminApp: FirebaseApp;
let db: Firestore;

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (getAdminApps().length === 0) {
    try {
      // Try to load service account from environment variable or file
      const serviceAccountPath = join(__dirname, "serviceAccount.json");
      
      let serviceAccount;
      try {
        const serviceAccountFile = readFileSync(serviceAccountPath, "utf8");
        serviceAccount = JSON.parse(serviceAccountFile);
      } catch (e) {
        // Check for environment variables (for Netlify/Vercel deployment)
        if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
          };
        } else {
          console.log("⚠️ Firebase Admin: serviceAccount.json not found and no env vars");
        }
      }
      
      if (serviceAccount) {
        adminApp = initializeApp({
          credential: cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin Initialized");
      } else {
        // Try default credentials (for local development with GOOGLE_APPLICATION_CREDENTIALS)
        adminApp = initializeApp();
        console.log("🔥 Firebase Admin Initialized (default credentials)");
      }
      
      db = getFirestore(adminApp);
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      throw error;
    }
  } else {
    adminApp = getAdminApps()[0];
    db = getFirestore(adminApp);
  }
  
  return { adminApp, db };
}

// Initialize on module load
try {
  const result = initFirebaseAdmin();
  console.log("✅ Firebase Firestore connected");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Firestore:", error);
}

export { db, adminApp };

// Helper function to get collection with type
export function getCollection<T = DocumentData>(collectionName: string): CollectionReference<T> {
  if (!db) {
    initFirebaseAdmin();
  }
  return db.collection(collectionName) as CollectionReference<T>;
}

// Helper function to convert Firestore document to object
export function docToObject<T>(doc: FirebaseFirestore.DocumentSnapshot<T>): T | null {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as T;
}

// Helper function to convert Firestore query snapshot to array
export function queryToArray<T>(snapshot: FirebaseFirestore.QuerySnapshot<T>): T[] {
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

// Collection names constants
export const COLLECTIONS = {
  USERS: "users",
  STUDENT_PROFILES: "studentProfiles",
  ACTIVITIES: "activities",
  COURSES: "courses",
  COURSE_LESSONS: "courseLessons",
  COURSE_QUIZZES: "courseQuizzes",
  QUIZ_QUESTIONS: "quizQuestions",
  QUIZ_ATTEMPTS: "quizAttempts",
  PROJECT_SUBMISSIONS: "projectSubmissions",
  COURSE_ENROLLMENTS: "courseEnrollments",
  CERTIFICATES: "certificates",
  LESSON_PROGRESS: "lessonProgress",
  AUDIT_LOGS: "auditLogs",
} as const;

