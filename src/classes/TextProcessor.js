// Import required dependencies
const axios = require('axios');
const db = require('../db');
const { promisify } = require('util');

// Create promisified versions of database methods for async/await support
const dbGet = promisify(db.get.bind(db));
const dbRun = promisify(db.run.bind(db));

/**
 * TextProcessor Class
 * 
 * A comprehensive text analysis processor that integrates with OpenAI's API
 * to perform advanced text analysis including language detection, sentiment analysis,
 * and word frequency analysis with stopword filtering.
 * 
 * Core Responsibilities:
 *  - Sends text to OpenAI GPT-3.5-turbo for AI-powered analysis
 *  - Extracts language (idiom), sentiment, and detailed word statistics
 *  - Processes and sorts words by frequency, separating stopwords from content words
 *  - Identifies top 5 most frequent non-stopwords for content analysis
 *  - Manages database persistence for term search functionality
 *  - Provides term search capabilities against previously analyzed texts
 * 
 * Features:
 *  - Case-sensitive word analysis preserving original text formatting
 *  - Intelligent stopword detection using AI
 *  - Comprehensive word frequency analysis with sorting
 *  - Database integration for persistent storage and retrieval
 *  - Error handling for API failures and database operations
 */
class TextProcessor {
  /**
   * Constructor - Initialize TextProcessor with OpenAI API credentials
   * @param {string} apiKey - OpenAI API key for authentication
   */
  constructor(apiKey) {
    this.publicAPI = apiKey;                    // Store OpenAI API key
    this.input = null;                          // Original input text
    this.output = null;                         // Processed analysis results
    this.termFoundedInLastAnalysis = false;     // Flag for term search results
  }


  /**
   * Main Analysis Method - Processes text through OpenAI API and prepares structured results
   * 
   * This method orchestrates the complete text analysis pipeline:
   * 1. Sends text to OpenAI GPT-3.5-turbo with detailed analysis instructions
   * 2. Receives structured JSON response with language, sentiment, and word data
   * 3. Post-processes the AI results to calculate statistics and rankings
   * 4. Organizes output into categorized word lists for API response
   * 
   * @param {string} text - The input text to analyze (preserves original formatting)
   * @returns {Promise<void>} - Results stored in this.output property
   */
  async inputIAData(text) {
    // Store original input text for reference
    this.input = text;

    /**
     * AI Prompt Engineering - Structured instructions for OpenAI API
     * 
     * This prompt is carefully crafted to ensure:
     * - Consistent JSON response format
     * - Preservation of original text formatting (case-sensitive)
     * - Accurate stopword detection without text normalization
     * - Language detection and sentiment analysis
     * - Word frequency counting with exact duplicate grouping
     */
    const prompt = `
You are a text analysis processor.
Analyze the input text exactly as written, without making any corrections or assumptions.

Perform the following:
1. Detect the language (idiom).
2. Detect the sentiment: positive, negative, or neutral.
3. Split the text into ALL words exactly as they appear in the input, including stopwords and typos.
4. Group identical words together (case-sensitive) and return:
   - word: exactly as in the original text
   - count: total occurrences of this exact word
   - isStopWord: true if the word exactly matches a known stopword in its original spelling, otherwise false.

Return ONLY a valid JSON in this exact format:
{
  "idiom": "<language>",
  "sentiment": "<sentiment>",
  "words": [
    { "word": "example", "count": 2, "isStopWord": false },
    { "word": "the", "count": 5, "isStopWord": true }
  ]
}

Critical Rules:
- Do NOT correct typos, spelling mistakes, or grammar.
- Do NOT infer or replace any word with another.
- Do NOT normalize or merge words beyond grouping exact duplicates.
- Analyze each word literally as it appears in the input text.
- Keep case-sensitive spelling exactly as provided.
- Each word should appear only once in the list with its total count.
- Stopword detection applies ONLY if the word exactly matches a stopword in the same spelling.
- Return valid JSON only, no explanations, no additional text.
`;

    try {
      /**
       * OpenAI API Integration
       * Makes HTTP POST request to OpenAI's Chat Completions endpoint
       * Using GPT-3.5-turbo model for cost-effective text analysis
       */
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',                    // Cost-effective model choice
          messages: [
            { role: 'system', content: prompt },     // System prompt with instructions
            { role: 'user', content: text }          // User input text to analyze
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${this.publicAPI}`,  // API authentication
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse AI response - extract JSON from the completion
      const aiResult = JSON.parse(response.data.choices[0].message.content.trim());

      /**
       * Data Processing Pipeline
       * Post-processes AI results to create structured, sorted output
       */
      
      // Calculate total word count by summing individual word counts
      const total_words = aiResult.words.reduce((sum, w) => sum + w.count, 0);

      // Separate words into content words and stopwords for different analysis
      const nonStopWords = aiResult.words.filter(w => !w.isStopWord);
      const stopWords = aiResult.words.filter(w => w.isStopWord);

      /**
       * Custom sorting algorithm for word frequency analysis
       * Primary sort: by count (descending) - most frequent words first
       * Secondary sort: alphabetically - consistent ordering for same counts
       */
      const sortByCountAndAlpha = (a, b) => {
        if (b.count !== a.count) return b.count - a.count;    // Sort by frequency first
        return a.word.localeCompare(b.word);                  // Then alphabetically
      };

      // Apply sorting to both word categories
      nonStopWords.sort(sortByCountAndAlpha);
      stopWords.sort(sortByCountAndAlpha);

      // Extract top 5 most frequent content words (excluding stopwords)
      const top5NonStopWords = nonStopWords.slice(0, 5);

      /**
       * Structure Final Output
       * Organize all analysis results into a comprehensive response object
       */
      this.output = {
        idiom: aiResult.idiom,                    // Detected language
        sentiment: aiResult.sentiment,            // Sentiment analysis result
        total_words,                              // Total word count
        top_5_words: top5NonStopWords,           // Top 5 most frequent content words
        non_stopwords: nonStopWords,             // All content words (sorted)
        stopwords: stopWords                      // All stopwords (sorted)
      };
    } catch (error) {
      // Handle any errors during API call or processing
      this.output = { error: 'Error retrieving analysis from AI' };
    }
  }

  /**
   * Term Search Method - Searches for a specific term in the last analyzed text
   * 
   * This method retrieves the most recent analysis from the database and performs
   * a case-sensitive search for the provided term within the stored text.
   * 
   * @param {string} term - The search term to look for in the last analysis
   * @returns {Promise<void>} - Result stored in this.termFoundedInLastAnalysis property
   */
  async searchTerm(term) {
    try {
      // Query database for the most recent analysis text
      const lastAnalysis = await dbGet('SELECT text FROM last_analysis ORDER BY id DESC LIMIT 1');
      
      // Debug logging to monitor database query results
      console.log(lastAnalysis);
      
      // Perform case-sensitive search for the term in the stored text
      // Returns true if term is found, false if no analysis exists or term not found
      this.termFoundedInLastAnalysis = lastAnalysis ? lastAnalysis.text.includes(term) : false;
    } catch (err) {
      // Handle database errors and log for debugging
      console.error('Error searching term:', err.message);
      this.termFoundedInLastAnalysis = false;
    }
  }

  /**
   * Database Persistence Method - Saves analyzed text for future term searches
   * 
   * This method manages the storage of analyzed text in the SQLite database.
   * It follows a single-record pattern: removes any existing analysis and
   * stores the new text as the current analysis for term searching.
   * 
   * @param {string} text - The analyzed text to persist in the database
   * @returns {Promise<void>} - Database operations are awaited for completion
   */
  async saveLastAnalysis(text) {
    try {
      // Remove any existing analysis to maintain single-record pattern
      await dbRun('DELETE FROM last_analysis');
      
      // Insert the new analysis text with automatic timestamp
      await dbRun('INSERT INTO last_analysis (text) VALUES (?)', [text]);
    } catch (err) {
      // Log database errors for debugging purposes
      console.error('Error saving last analysis:', err.message);
    }
  }

  /**
   * Output Method - Returns the processed analysis results
   * 
   * This method provides access to the final analysis results after
   * processing through the AI API and local data manipulation.
   * 
   * @returns {Object} - Complete analysis object containing:
   *   - idiom: detected language
   *   - sentiment: positive/negative/neutral
   *   - total_words: total word count
   *   - top_5_words: most frequent non-stopwords
   *   - non_stopwords: all content words (sorted)
   *   - stopwords: all stopwords (sorted)
   *   - error: error message if processing failed
   */
  outputData() {
    return this.output;
  }
}

// Export the TextProcessor class for use in other modules
module.exports = TextProcessor;
