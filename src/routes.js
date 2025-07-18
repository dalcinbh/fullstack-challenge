/**
 * API Routes Controller
 * Handles all HTTP requests for the Text Analysis API
 * Provides endpoints for text analysis and term searching
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const TextProcessor = require('./classes/TextProcessor');

// Cache for storing the last analysis result in memory
let lastAnalysis = null;

/**
 * POST /api/analyze-text
 * Analyzes the given text using AI integration:
 *  - Detects language (idiom)
 *  - Detects sentiment (positive/negative/neutral)
 *  - Identifies stopwords and word frequencies
 *  - Returns top 5 most frequent non-stopwords
 * Stores the result in database for future term searches.
 * 
 * Request Body: { "text": "string to analyze" }
 * Response: { idiom, sentiment, total_words, top_5_words, non_stopwords, stopwords }
 */
router.post('/analyze-text', async (req, res) => {
  // Extract text from request body
  const { text } = req.body;

  // Validate that text is provided and not empty
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Text is required.' });
  }

  try {
    // Initialize TextProcessor with OpenAI API key from environment
    const processor = new TextProcessor(process.env.PUBLIC_API_KEY);
    
    // Process text through AI analysis (OpenAI API call)
    await processor.inputIAData(text);   
    
    // Persist the analyzed text to database for future term searches
    await processor.saveLastAnalysis(text);
    
    // Return the complete analysis result as JSON
    return res.json(processor.outputData());
  } catch (error) {
    // Handle any errors during processing and return 500 status
    return res.status(500).json({ error: 'Error analyzing text.' });
  }
});

/**
 * GET /api/search-term?term=searchWord
 * Searches for a specific term in the last analyzed text.
 * Uses case-insensitive matching against the stored text.
 * 
 * Query Parameters: term (required) - The word/phrase to search for
 * Response: { term, termFoundedInLastAnalysis: boolean }
 */
router.get('/search-term', async (req, res) => {
  // Extract search term from query parameters
  const { term } = req.query;

  // Validate that term parameter is provided
  if (!term) {
    return res.status(400).json({ error: 'Term is required' });
  }

  // Initialize TextProcessor with OpenAI API key
  const processor = new TextProcessor(process.env.PUBLIC_API_KEY);
  
  // Search for the term in the last analysis stored in database
  await processor.searchTerm(term);
  
  // Return search results indicating if term was found
  res.json({ term, termFoundedInLastAnalysis: processor.termFoundedInLastAnalysis });
});

// Export router to be used in main application
module.exports = router;
