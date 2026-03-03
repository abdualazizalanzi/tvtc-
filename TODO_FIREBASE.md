# Firebase Integration Plan

## Task: Connect Firebase to the project

### Steps:
- [x] 1. Install Firebase packages (client & admin)
- [x] 2. Create client Firebase config file (`client/src/lib/firebase.ts`)
- [x] 3. Create server Firebase admin config file (`server/firebase-admin.ts`)
- [x] 4. Add Firebase service account (`server/serviceAccount.json`)
- [x] 5. Set user as supervisor (`server/set-supervisor.ts`)

### Firebase Configuration:
- apiKey: AIzaSyCn-8hbJENLTGM8874U2tSsdkrcr0ip67k
- authDomain: tvtc-763fd.firebaseapp.com
- projectId: tvtc-763fd
- storageBucket: tvtc-763fd.firebasestorage.app
- messagingSenderId: 661475702519
- appId: 1:661475702519:web:d2beb07fcf7c2956ea45f2
- measurementId: G-Q3ZPBWXWQ3

---

## ⚠️ Important: Setup Service Account

To enable Firebase Admin features, you need to download the service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **tvtc-763fd**
3. Go to **Project Settings** (gear icon ⚙️)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as: `server/serviceAccount.json`

---

## Available Firebase Features

### Client (client/src/lib/firebase.ts):
- ✅ Firebase App initialization
- ✅ Firebase Auth
- ✅ Firestore
- ✅ Analytics

### Server (server/firebase-admin.ts):
- ✅ Firebase Admin initialization
- ✅ Firestore Admin
- ✅ Auth (verify tokens, custom tokens)
- ✅ Messaging (push notifications)
- Helper functions:
  - `verifyIdToken(idToken)` - Verify Firebase ID token
  - `createCustomToken(uid, claims)` - Create custom auth token
  - `sendPushNotification(token, payload)` - Send push notification
  - `getUserByEmail(email)` - Get user by email
  - `setCustomUserClaims(uid, claims)` - Set custom user claims
