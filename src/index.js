/**
 * Main application entry point for the Text Analysis API
 * Configures Express server with necessary middleware and routes
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required dependencies
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

// Initialize Express application
const app = express();

// Set server port from environment variable or default to 5000
const port = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Parse incoming JSON requests and make data available in req.body
app.use(express.json());

/**
 * Routes Configuration
 */
// Mount all API routes under /api prefix
app.use('/api', routes);

/**
 * Start Server
 */
// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});