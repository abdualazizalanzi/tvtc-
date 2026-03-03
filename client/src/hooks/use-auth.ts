  import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import {
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logout as firebaseLogout,
  getIdToken,
  resetPassword,
  auth,
} from "../lib/firebase-auth";

// Current Firebase user
let currentFirebaseUser: User | null = null;

// Auth state observer
function initializeAuth() {
  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged((user) => {
      currentFirebaseUser = user;
      resolve(user);
      // Don't unsubscribe - keep listening
    });
  });
}

// Fetch user profile from server
async function fetchUser(): Promise<User | null> {
  // Get Firebase ID token
  if (!auth.currentUser) {
    return null;
  }
  
  const idToken = await getIdToken(auth.currentUser);
  
  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Login function
async function loginFn(email: string, password: string): Promise<User> {
  const user = await signInWithEmail(email, password);
  const idToken = await getIdToken(user);
  
  // Send token to server to create session
  await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });
  
  return user;
}

// Login with Google
async function loginWithGoogleFn(): Promise<User> {
  const user = await signInWithGoogle();
  const idToken = await getIdToken(user);
  
  await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });
  
  return user;
}

// Sign up function
async function signUpFn(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<User> {
  const user = await signUpWithEmail(data.email, data.password, data.firstName, data.lastName);
  const idToken = await getIdToken(user);
  
  // Send token to server
  await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      idToken,
      firstName: data.firstName,
      lastName: data.lastName,
    }),
    credentials: "include",
  });
  
  return user;
}

// Logout function
async function logoutFn(): Promise<void> {
  await firebaseLogout();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/";
}

// Password reset
async function resetPasswordFn(email: string): Promise<void> {
  await resetPassword(email);
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth().then(() => {
      setIsInitialized(true);
    });
  }, []);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: isInitialized && !!auth.currentUser,
  });

  const loginMutation = useMutation({
    mutationFn: loginFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationFn: loginWithGoogleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUpFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordFn,
  });

  return {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user || !!auth.currentUser,
    login: loginMutation.mutate,
    loginWithGoogle: loginWithGoogleMutation.mutate,
    signUp: signUpMutation.mutate,
    logout: logoutMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    loginError: loginMutation.error,
    signUpError: signUpMutation.error,
    firebaseUser: auth.currentUser,
  };
}

// Export for direct auth access
export { auth };
