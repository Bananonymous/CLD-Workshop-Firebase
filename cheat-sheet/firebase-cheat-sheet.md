# Firebase Cheat Sheet for Engineers

## What is Firebase?
Firebase is Google's comprehensive app development platform that provides backend services, easy-to-use SDKs, and ready-made UI libraries to authenticate users, store data, and more.

## Why Firebase is Interesting
- **Rapid Development**: Build apps faster with pre-built backend services
- **Real-time Capabilities**: Synchronize data across clients instantly
- **Scalability**: Automatic scaling without infrastructure management
- **Integrated Ecosystem**: All services work seamlessly together
- **Cross-platform**: Web, iOS, Android, and more

## Getting Started

### 1. Prerequisites
```bash
# Install Node.js (version 14 or later)
# Install Firebase CLI
npm install -g firebase-tools
```

### 2. Project Setup
```bash
# Login to Firebase
firebase login

# Initialize new project
firebase init

# Select services you want to use:
# - Firestore (database)
# - Functions (serverless)
# - Hosting (web hosting)
# - Storage (file storage)
```

### 3. Configuration
```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export default app;
```

## Core Operations

### Authentication
```javascript
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

// Create user
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
  });

// Sign in user
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
  });

// Sign out
auth.signOut();
```

### Firestore Database
```javascript
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';

const db = getFirestore();

// Add document
addDoc(collection(db, "tasks"), {
  title: "Learn Firebase",
  completed: false,
  createdAt: new Date()
});

// Read documents
const querySnapshot = await getDocs(collection(db, "tasks"));
querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});

// Real-time listener
onSnapshot(collection(db, "tasks"), (snapshot) => {
  snapshot.forEach((doc) => {
    console.log(doc.data());
  });
});
```

### Cloud Storage
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

// Upload file
const fileRef = ref(storage, 'uploads/' + file.name);
uploadBytes(fileRef, file).then((snapshot) => {
  console.log('File uploaded successfully');
});

// Get download URL
getDownloadURL(fileRef).then((url) => {
  console.log('File available at:', url);
});
```

### Cloud Functions
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// HTTP Cloud Function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

// Firestore Trigger
exports.createUserProfile = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const userData = snap.data();
    console.log('New user created:', userData);
  });
```

### Hosting
```bash
# Build your app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy specific functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

## Security Rules

### Firestore Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read, authenticated write
    match /tasks/{taskId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Development Commands

```bash
# Start local emulators
firebase emulators:start

# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting

# View logs
firebase functions:log

# Set environment config
firebase functions:config:set api.key="your-key"

# Get environment config
firebase functions:config:get
```

## Best Practices

1. **Use Firestore Subcollections** for hierarchical data
2. **Implement proper security rules** before going to production
3. **Use Cloud Functions** for server-side logic and data validation
4. **Optimize queries** by creating appropriate indexes
5. **Handle offline scenarios** in your client code
6. **Use Firebase Analytics** to understand user behavior
7. **Implement proper error handling** for all Firebase operations

## Limitations to Consider

- **Query limitations**: Limited complex queries compared to SQL
- **Vendor lock-in**: Difficult to migrate away from Firebase
- **Cost scaling**: Can become expensive with high usage
- **Regional restrictions**: Limited control over data location
- **Real-time limits**: Connection limits for concurrent users

## Useful Resources

- **Official Documentation**: https://firebase.google.com/docs
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Pricing Calculator**: https://firebase.google.com/pricing
- **Status Page**: https://status.firebase.google.com/
- **Community Forum**: https://firebase.google.com/support
