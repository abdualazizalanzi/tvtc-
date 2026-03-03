// Firebase Admin Configuration
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if already initialized
if (!admin.apps.length) {
  try {
    // Try to load service account from environment variable or file
    // In production, use: admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount)
    // });
    
    // Check for service account file
    const serviceAccountPath = join(__dirname, "serviceAccount.json");
    
    let serviceAccount;
    try {
      const serviceAccountFile = readFileSync(serviceAccountPath, "utf8");
      serviceAccount = JSON.parse(serviceAccountFile);
    } catch (e) {
      // Service account file not found
      // In production, you must provide credentials via:
      // 1. GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to JSON file
      // 2. Or pass service account directly
      
      console.log("⚠️ Firebase Admin: serviceAccount.json not found");
      console.log("📝 To enable Firebase Admin features:");
      console.log("   1. Go to Firebase Console > Project Settings > Service Accounts");
      console.log("   2. Click 'Generate New Private Key'");
      console.log("   3. Save as 'server/serviceAccount.json'");
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("🔥 Firebase Admin Initialized with service account");
    } else {
      // Initialize with default credentials (requires GOOGLE_APPLICATION_CREDENTIALS)
      admin.initializeApp();
      console.log("🔥 Firebase Admin Initialized (default credentials)");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export default admin;

// Export commonly used Firebase Admin services
export const db = admin.firestore();
export const auth = admin.auth();
export const messaging = admin.messaging();

// Helper function to verify ID tokens
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw error;
  }
}

// Helper function to create custom token
export async function createCustomToken(uid: string, additionalClaims?: Record<string, any>) {
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw error;
  }
}

// Helper function to send push notification
export async function sendPushNotification(
  token: string, 
  payload: admin.messaging.MessagingPayload
) {
  try {
    const response = await messaging.send({
      token: token,
      ...payload
    });
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

// Helper function to get user by email
export async function getUserByEmail(email: string) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

// Helper function to set custom user claims
export async function setCustomUserClaims(uid: string, claims: Record<string, any>) {
  try {
    await auth.setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims set for user: ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw error;
  }
}

