# InvenShop - Inventory Management (Full-Stack)

This document outlines the architecture and setup instructions for transitioning the InvenShop application from a frontend prototype to a full-stack solution with a Node.js backend.

## 1. Project Overview

InvenShop is a digital inventory management platform for local retailers. This version is architected to connect with a backend server, which will handle data persistence, business logic, and secure communication with third-party APIs like the Google Gemini API.

## 2. Data Schema

The application's data structure is defined in `schema.ts`. This serves as the single source of truth for our data models and should be used to design your database tables or collections.

**Key Models:**

-   **`Product`**: Represents an item in the inventory. It is linked to a `Supplier`.
-   **`Supplier`**: A company or individual who provides products.
-   **`Customer`**: A person who buys products, potentially on credit.
-   **`Transaction`**: A record of credit or payment for a `Customer`.
-   **`SupplierTransaction`**: A record of a purchase from or payment to a `Supplier`.

Refer to `schema.ts` for detailed field definitions.

## 3. Backend Setup Instructions

The following are instructions and example code snippets to set up a basic Node.js and Express backend that is compatible with this frontend.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   `npm` or `yarn`
-   A database (e.g., MongoDB, PostgreSQL, or SQLite)

### Step 1: Initialize the Backend Project

Create a new directory for your backend (e.g., `server`) and initialize a Node.js project.

```bash
mkdir server
cd server
npm init -y
npm install express cors dotenv mongodb
```

### Step 2: Create the Server File

Create a file named `index.js` in the `server` directory. This will be your main server entry point.

### Step 3: Set Up Environment Variables

Create a `.env` file in the `server` directory to store your sensitive information. **Never commit this file to version control.**

```
# .env

# Your database connection string
DATABASE_URL="mongodb://localhost:27017/invenshop"

# Your Google Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# The port your server will run on
PORT=5000
```

### Step 4: Define API Endpoints

Here are the API endpoints the frontend expects. You should implement these routes in your `index.js` file.

```javascript
// server/index.js (Example using Express and MongoDB)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let db;

// Connect to MongoDB
MongoClient.connect(DATABASE_URL)
  .then(client => {
    console.log('Connected to Database');
    db = client.db();
  })
  .catch(error => console.error(error));

// --- API ROUTES ---

// GET /api/data - Fetch all initial data
app.get('/api/data', async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();
    const customers = await db.collection('customers').find().toArray();
    const suppliers = await db.collection('suppliers').find().toArray();
    const transactions = await db.collection('transactions').find().toArray();
    const supplierTransactions = await db.collection('supplierTransactions').find().toArray();
    res.json({ products, customers, suppliers, transactions, supplierTransactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch initial data' });
  }
});

// POST /api/products - Add a single product
app.post('/api/products', async (req, res) => {
    const newProduct = req.body;
    try {
        const result = await db.collection('products').insertOne(newProduct);
        res.status(201).json({ ...newProduct, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// POST /api/products/bulk - Add multiple products
app.post('/api/products/bulk', async (req, res) => {
    const newProducts = req.body;
    try {
        const result = await db.collection('products').insertMany(newProducts);
        res.status(201).json({ insertedCount: result.insertedCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to bulk import products' });
    }
});

// PUT /api/products/:id - Update product stock
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    try {
        await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: { stock } });
        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update stock' });
    }
});

// Add other endpoints for Customers, Suppliers, and Transactions similarly...
// POST /api/customers, POST /api/transactions, etc.


// POST /api/ai/ask - Secure endpoint for Dukaan Mitra
app.post('/api/ai/ask', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ message: "AI assistant is not configured on the server." });
  }
  const { query, products, suppliers, shopType } = req.body;
  const ai = new GoogleGenAI(GEMINI_API_KEY);
  
  // Your existing geminiService logic here...
  // This is a simplified version.
  const prompt = `You are Dukaan Mitra... based on this data: ${JSON.stringify(products)}. User asks: ${query}`;
  
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: "Failed to get response from AI assistant." });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 4. Frontend Integration

The frontend has been refactored to communicate with the backend.

-   **`services/apiService.ts`**: This file contains all the functions for making HTTP requests to your backend endpoints. It uses the `fetch` API.
-   **`App.tsx`**: The main component now uses `useEffect` to fetch initial data from `/api/data` when the application loads. All data manipulation functions (e.g., `handleAddProduct`) now call the relevant `apiService` function.
-   **`useLocalStorage` has been removed**: The app no longer relies on browser storage for data persistence.

## 5. Running the Full-Stack App

1.  **Start the Backend Server:**
    ```bash
    cd server
    node index.js
    ```
    Your backend should now be running on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    In a separate terminal, navigate to the root directory of the frontend project and run its start command. The frontend is configured to send API requests to `http://localhost:5000`.

Now, your InvenShop application will be running in full-stack mode, with data being fetched from and saved to your backend and database.
