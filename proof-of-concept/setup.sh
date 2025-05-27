#!/bin/bash

# Firebase Task Manager - Setup Script
# This script helps new team members set up the project quickly

echo "🚀 Firebase Task Manager - Team Setup"
echo "========================================"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local already exists"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Your existing .env.local is preserved."
        exit 0
    fi
fi

# Copy template
if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo "✅ Copied .env.example to .env.local"
else
    echo "❌ .env.example not found!"
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local with your Firebase credentials"
echo "2. Get credentials from Firebase Console → Project Settings → Your apps"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📖 For more details, see:"
echo "   - README.md"
echo "   - ../docs/firebase-security-guide.md"
echo ""
echo "🔐 IMPORTANT: Never commit .env.local to git!"
echo "🔥 Firebase config is now integrated directly in main.js"

# Check if VS Code is available and offer to open the file
if command -v code &> /dev/null; then
    echo ""
    read -p "Open .env.local in VS Code now? (y/N): " open_vscode
    if [[ $open_vscode =~ ^[Yy]$ ]]; then
        code .env.local
    fi
fi

echo "Setup complete! 🎉"
