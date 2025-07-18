/**
 * TextAnalyzer Component
 * 
 * This component provides a complete text analysis interface that:
 * - Accepts user text input through a textarea
 * - Sends text to the backend API for AI-powered analysis
 * - Displays comprehensive analysis results including sentiment, word frequency, and language detection
 * - Handles loading states and error management
 * - Renders organized results with stopwords and non-stopwords categorization
 */

// Import React and useState hook for component state management
import React, { useState } from "react";

// Import axios for HTTP requests to the backend API
import axios from "axios";

/**
 * TextAnalyzer functional component
 * 
 * Manages the complete text analysis workflow from input to results display
 * @returns {JSX.Element} The text analyzer interface with input and results sections
 */
function TextAnalyzer() {
  // State for storing user input text
  const [text, setText] = useState("");
  
  // State for storing API response with analysis results
  const [result, setResult] = useState(null);
  
  // State for managing loading state during API calls
  const [loading, setLoading] = useState(false);

  /**
   * Event handler for text analysis
   * 
   * Validates input, makes API call to backend, and handles the response.
   * Manages loading state and error handling throughout the process.
   */
  const handleAnalyze = async () => {
    // Validate that user has entered non-empty text
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }
    
    // Set loading state to show user that analysis is in progress
    setLoading(true);
    
    try {
      // Make POST request to backend API with user's text
      // Backend will process text through OpenAI and return analysis results
      const response = await axios.post("http://localhost:5000/api/analyze-text", { text });
      
      // Store the complete analysis results in state for rendering
      setResult(response.data);
    } catch (error) {
      // Log error details for debugging
      console.error(error);
      
      // Show user-friendly error message
      alert("Error analyzing text.");
    }
    
    // Always reset loading state after API call completes
    setLoading(false);
  };

  return (
    <div>
      {/* 
        Text Input Section 
        Large textarea for user to enter text they want to analyze
      */}
      <textarea
        rows="5"
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      
      {/* 
        Analysis Button 
        Triggers the API call and shows loading state
        Disabled during analysis to prevent multiple simultaneous requests
      */}
      <button
        style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}
        onClick={handleAnalyze}
        disabled={loading}
      >
        {/* Dynamic button text based on loading state */}
        {loading ? "Analyzing..." : "Analyze Text"}
      </button>

      {/* 
        Results Section 
        Conditionally rendered only when API response is available
        Shows comprehensive analysis results in organized sections
      */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Analysis Result:</h3>

          {/* Core Analysis Metrics - Primary specification requirements */}
          <p><strong>Total Words:</strong> {result.total_words}</p>
          <p><strong>Sentiment:</strong> {result.sentiment}</p>

          {/* 
            Top 5 Most Frequent Words Section
            Displays the most common non-stopwords with their counts
            Implements safe rendering with fallback for empty data
          */}
          <h4>Top 5 Words (ignoring stopwords):</h4>
          <ul>
            {result.top_5_words && result.top_5_words.length > 0 ? (
              result.top_5_words.map((w, index) => (
                <li key={index}>
                  {w.word} ({w.count})
                </li>
              ))
            ) : (
              <li>No data available</li>
            )}
          </ul>

          {/* 
            Language Detection Section
            Shows the detected language/idiom of the input text
          */}
          <h4>Language Detected:</h4>
          <p>{result.idiom}</p>

          {/* 
            Complete Non-Stopwords List
            Displays all content words (excluding common stopwords) sorted by frequency
            Provides comprehensive word frequency analysis for content analysis
          */}
          <h4>All Non-Stopwords:</h4>
          <ul>
            {result.non_stopwords && result.non_stopwords.length > 0 ? (
              result.non_stopwords.map((w, index) => (
                <li key={index}>
                  {w.word} ({w.count})
                </li>
              ))
            ) : (
              <li>No non-stopwords found</li>
            )}
          </ul>

          {/* 
            Complete Stopwords List
            Displays all detected stopwords (common words like "the", "and", etc.)
            Sorted by frequency for linguistic analysis purposes
          */}
          <h4>All Stopwords:</h4>
          <ul>
            {result.stopwords && result.stopwords.length > 0 ? (
              result.stopwords.map((w, index) => (
                <li key={index}>
                  {w.word} ({w.count})
                </li>
              ))
            ) : (
              <li>No stopwords found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Export TextAnalyzer component as default export for use in App.js
export default TextAnalyzer;
