# Firebase Configuration Security Guide

## 🔒 Managing Firebase Credentials in Team Projects

### Overview
Firebase client-side configuration contains **public credentials** that are meant to be exposed in your frontend application. However, you still want to manage them securely in team environments.

## 🌟 Recommended Approach: Environment Variables

### 1. Setup Environment Variables

**Structure:**
```
.env.example          # Template (commit to git)
.env.local           # Your actual values (DO NOT commit)
main.js              # Contains Firebase config using environment variables
```

### 2. For Team Members

**Each developer should:**

1. Copy the template:
```bash
cp .env.example .env.local
```

2. Get credentials from Firebase Console:
   - Go to Firebase Console → Project Settings
   - Navigate to "Your apps" section
   - Copy the config values

3. Fill in `.env.local` with actual values

### 3. Alternative Approaches

#### Option A: Separate Environment Files
```
.env.development     # Development environment
.env.staging        # Staging environment  
.env.production     # Production environment
main.js             # Automatically loads based on NODE_ENV
```

#### Option B: Use Firebase Projects per Environment
- `my-app-dev` (development)
- `my-app-staging` (staging)  
- `my-app-prod` (production)

#### Option C: Separate Config Files (if needed for complex setups)
```
config/
  firebase.dev.js     # Development config
  firebase.prod.js    # Production config
  index.js           # Imports based on environment
main.js              # Imports from config/
```

## 🛡️ Security Best Practices

### 1. Firebase Client Config is Public
```javascript
// These credentials are PUBLIC and safe to expose:
// - apiKey
// - authDomain
// - projectId
// - storageBucket
// - messagingSenderId
// - appId

// They are NOT secret keys - they identify your Firebase project
```

### 2. What to Keep Secret
```javascript
// NEVER commit these (if you have them):
// - Service Account Keys (.json files)
// - Admin SDK credentials
// - Private keys
// - Database URLs with secrets
```

### 3. Firestore Security Rules
Your security comes from **Firestore Rules**, not hidden config:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Team Workflow

### 1. Project Setup
```bash
# Clone repository
git clone <repo-url>
cd project-name

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Get Firebase credentials from team lead or Firebase Console
# Fill in .env.local with actual values

# Start development
npm run dev
```

### 2. Adding New Team Members
1. Share Firebase Console access
2. Provide `.env.local` values securely (Slack DM, password manager, etc.)
3. Document the setup process in README

### 3. Different Environments
```bash
# Development
VITE_FIREBASE_PROJECT_ID=my-app-dev

# Staging  
VITE_FIREBASE_PROJECT_ID=my-app-staging

# Production
VITE_FIREBASE_PROJECT_ID=my-app-prod
```

## 📋 Checklist for Secure Firebase Setup

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` template exists
- [ ] Firebase config uses environment variables
- [ ] Firestore security rules are configured
- [ ] Authentication is properly set up
- [ ] Service account keys (if any) are excluded from git
- [ ] Team members know how to get credentials
- [ ] Different projects for different environments

## 🔧 Implementation Example

**main.js:**
```javascript
// Firebase Configuration - Environment Variables Only
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    // ... other config
};

// Validation
const requiredEnvVars = ['VITE_FIREBASE_API_KEY', /* ... */];
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
}
```

**vite.config.js:** (Automatically loads .env files)
```javascript
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Vite automatically loads .env files
    // VITE_ prefixed variables are available in client
  };
});
```

## 🚨 Common Mistakes to Avoid

1. **DON'T** commit `.env.local` or `.env.production`
2. **DON'T** put service account JSON files in your repository
3. **DON'T** rely on hiding client config for security
4. **DO** use Firestore Security Rules for data protection
5. **DO** use Firebase Authentication for user management
6. **DO** separate environments (dev/staging/prod)

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
