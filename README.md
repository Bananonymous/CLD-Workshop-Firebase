# CLD Workshop - Google Firebase

## Project Overview
This project explores Google Firebase as a cloud platform for small/medium businesses, demonstrating its capabilities through a practical proof-of-concept application.

## Firebase Features Explored
- **Real-time Database**: NoSQL cloud database with real-time synchronization
- **Authentication**: User management and authentication services
- **Hosting**: Fast and secure web hosting
- **Cloud Functions**: Serverless backend functions
- **Storage**: Cloud storage for user-generated content

## Project Structure
```
├── docs/                    # Documentation and presentation materials
├── proof-of-concept/        # Demo application with integrated Firebase config
├── cheat-sheet/            # Technical reference guide
└── cost-analysis/          # Cost scenarios and calculations
```

**Key Files:**
- `proof-of-concept/main.js` - Application logic with embedded Firebase configuration
- `proof-of-concept/.env.local` - Environment variables (not committed to git)
- `proof-of-concept/.env.example` - Template for team members

## Getting Started

### For Team Members
1. Clone this repository
2. Copy environment template: `cp proof-of-concept/.env.example proof-of-concept/.env.local`
3. Get Firebase credentials from team lead or Firebase Console
4. Fill in `.env.local` with actual values
5. Install dependencies: `cd proof-of-concept && npm install`
6. Start development server: `npm run dev`

### Firebase Setup
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize project: `firebase init`
4. Deploy: `firebase deploy`

**🔒 Security:** See [Firebase Security Guide](docs/firebase-security-guide.md) for team collaboration best practices.

## Demo Application
A task management application showcasing Firebase's real-time capabilities, user authentication, and cloud storage.

## Team Members
- [Add your team members here]

## Presentation Schedule
- Session: [Add your chosen session]
- Date: [June 10 or June 12, 2025]
