/**
 * Smart Library System - Backend Server
 * 
 * This is the main entry point for the Express.js backend server.
 * It handles database connections, middleware setup, and route configuration.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express application
const app = express();

// ============ MIDDLEWARE CONFIGURATION ============

// Parse incoming JSON requests (allows req.body to be accessed)
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS)
// This allows the frontend (running on a different port) to make requests to this backend
app.use(cors());

// ============ DATABASE CONNECTION ============

/**
 * Connect to MongoDB database using Mongoose
 * Connection string is stored in environment variable for security
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process if database connection fails
    process.exit(1);
  });

// ============ API ROUTES ============

/**
 * User routes - handles authentication and user management
 * Base path: /api/users
 */
app.use('/api/users', require('./routes/userRoutes'));

/**
 * Book routes - handles CRUD operations for books
 * Base path: /api/books
 */
app.use('/api/books', require('./routes/bookRoutes'));

// Health check endpoint to verify server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Library System API is running',
    version: '1.0.0'
  });
});

// ============ SERVER STARTUP ============

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}`);
});
