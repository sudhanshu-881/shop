#!/bin/bash

echo "🚀 Setting up InvenShop Backend..."

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run database migrations: npm run migrate"
echo "2. Seed the database: npm run seed"
echo "3. Start the server: npm run dev"
echo ""
echo "The server will be available at http://localhost:5000"