# Netlify Deployment Guide

## Prerequisites

1. **Firebase Project**: Ensure you have a Firebase project at https://console.firebase.google.com/
2. **Netlify Account**: Sign up at https://www.netlify.com
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Configure Firebase

### 1.1 Enable Firestore Database
1. Go to Firebase Console > Firestore Database
2. Click "Create Database"
3. Choose a location (preferably closest to your users)
4. Start in **Production mode** (or Test mode for development)

### 1.2 Enable Authentication
1. Go to Firebase Console > Authentication
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Optionally enable **Google** sign-in

### 1.3 Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" and select your web app
3. Copy the Firebase configuration object

---

## Step 2: Set Environment Variables

In your Netlify site settings, add these environment variables:

### Required:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# For Admin SDK (Server-side)
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
```

### How to get Private Key:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. The JSON file contains the private key and client email

---

## Step 3: Deploy to Netlify

### Option A: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build your project
npm run build

# Deploy
netlify deploy --prod
```

### Option B: Via Git Integration
1. Connect your Git repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
3. Add environment variables in Netlify dashboard
4. Deploy!

---

## Step 4: Configure Security Rules

### Firestore Rules (Production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /studentProfiles/{profileId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read for all authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Firebase Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Project Structure for Netlify

The project is configured to work with Netlify:

- **`netlify.toml`**: Netlify configuration file
- **`vite.config.ts`**: Build configuration
- **`server/firebase-db.ts`**: Firebase Firestore connection
- **`server/firebase-storage.ts`**: Firestore storage layer

---

## Troubleshooting

### Common Issues:

1. **Firebase not connecting**
   - Check environment variables are set correctly
   - Verify Firestore is enabled
   - Check Firebase config matches

2. **Authentication issues**
   - Enable authentication providers in Firebase Console
   - Check that the domain is authorized

3. **Build failures**
   - Ensure Node version is 18+
   - Check all dependencies are installed

4. **CORS errors**
   - Configure CORS in Firebase Storage
   - Check Netlify redirect rules

---

## Alternative: Netlify Functions

If you need server-side functionality, you can use Netlify Functions:

1. Create functions in `netlify/functions/`
2. Configure in `netlify.toml`:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
```

---

## Support

- Netlify Docs: https://docs.netlify.com/
- Firebase Docs: https://firebase.google.com/docs
- Community: https://community.netlify.com/

