# InvenShop Backend Setup Guide

This guide will help you set up the InvenShop backend with Supabase PostgreSQL.

## Prerequisites

1. **Node.js** (v18 or later)
2. **npm** or **yarn**
3. **Supabase Account** - [Sign up here](https://supabase.com)
4. **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)

## Step 1: Supabase Setup

### 1.1 Create a New Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `invenshop`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"

### 1.2 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### 1.3 Run Database Migrations
1. Navigate to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `server/migrations/001_create_tables.sql`
3. Click "Run" to create the database schema
4. Copy and paste the contents of `server/migrations/002_create_rls_policies.sql`
5. Click "Run" to set up Row Level Security policies

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd server
npm install
```

### 2.2 Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2.3 Generate JWT Secret
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Create Logs Directory
```bash
mkdir -p logs
```

### 2.5 Seed Database (Optional)
```bash
npm run seed
```

## Step 3: Frontend Setup

### 3.1 Update Environment Variables
1. Copy the frontend environment file:
```bash
cp .env.example .env
```

2. Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=InvenShop
VITE_APP_VERSION=1.0.0
```

### 3.2 Install Frontend Dependencies
```bash
npm install
```

## Step 4: Running the Application

### 4.1 Start Backend Server
```bash
cd server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 4.2 Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Step 5: Docker Setup (Optional)

### 5.1 Using Docker Compose
```bash
cd server
docker-compose -f docker-compose.dev.yml up --build
```

### 5.2 Production Docker Setup
```bash
cd server
docker-compose up --build
```

## Step 6: Verification

### 6.1 Backend Health Check
Visit `http://localhost:5000/health` - you should see:
```json
{
  "success": true,
  "message": "InvenShop API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 6.2 API Endpoints Test
Test the API endpoints:
```bash
# Get all products
curl http://localhost:5000/api/products

# Get initial data
curl http://localhost:5000/api/data
```

### 6.3 Frontend Integration
1. Open `http://localhost:5173`
2. Complete the onboarding process
3. Try adding a product
4. Test the AI assistant (Dukaan Mitra)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your Supabase credentials
   - Check if the database migrations ran successfully
   - Ensure your IP is whitelisted in Supabase

2. **CORS Error**
   - Verify CORS_ORIGIN in backend .env
   - Check if frontend is running on the correct port

3. **AI Assistant Not Working**
   - Verify your Gemini API key
   - Check the AI health endpoint: `http://localhost:5000/api/ai/health`

4. **Rate Limiting**
   - Check the rate limit configuration
   - Monitor the logs for rate limit violations

### Logs
- Backend logs: `server/logs/`
- Check `combined.log` for all logs
- Check `error.log` for errors only

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk` - Bulk import products
- `PUT /api/products/:id/stock` - Update stock

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `POST /api/transactions` - Add transaction
- `GET /api/customers/:id/transactions` - Get customer transactions

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `POST /api/supplier-transactions` - Add supplier transaction
- `GET /api/suppliers/:id/transactions` - Get supplier transactions

### AI Assistant
- `POST /api/ai/ask` - Ask Dukaan Mitra
- `GET /api/ai/health` - AI service health check

## Next Steps

1. Set up production environment
2. Configure domain and SSL
3. Set up monitoring and alerts
4. Implement backup strategies
5. Add more advanced features

## Support

If you encounter any issues:
1. Check the logs first
2. Verify all environment variables
3. Test individual API endpoints
4. Check Supabase dashboard for database issues