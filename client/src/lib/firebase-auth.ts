// Firebase Authentication Utilities
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error("Firebase auth not initialized");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<User> {
  if (!auth) throw new Error("Firebase auth not initialized");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name
  await updateProfile(result.user, {
    displayName: `${firstName} ${lastName}`
  });
  
  return result.user;
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  if (!auth) throw new Error("Firebase auth not initialized");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Sign out
export async function logout(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

// Password reset
export async function resetPassword(email: string): Promise<void> {
  if (!auth) throw new Error("Firebase auth not initialized");
  await sendPasswordResetEmail(auth, email);
}

// Get ID token
export async function getIdToken(user: User): Promise<string> {
  return user.getIdToken();
}

// Get ID token with refresh
export async function getIdTokenResult(user: User): Promise<import("firebase/auth").IdTokenResult> {
  return user.getIdTokenResult();
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    console.warn("Firebase auth not initialized yet");
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Check if user is authenticated
export function isAuthenticated(user: User | null): boolean {
  return user !== null;
}

// Get user display name
export function getUserDisplayName(user: User | null): string {
  if (!user) return "";
  return user.displayName || user.email || "User";
}

// Get user email
export function getUserEmail(user: User | null): string {
  if (!user) return "";
  return user.email || "";
}

// Get user photo URL
export function getUserPhotoURL(user: User | null): string | null {
  if (!user) return null;
  return user.photoURL;
}

// Get user ID
export function getUserId(user: User | null): string | undefined {
  if (!user) return undefined;
  return user.uid;
}

// Export auth instance for direct access
export { auth };

