/**
 * Main App Component
 * 
 * This is the root component of the Text Analyzer application.
 * It provides the main layout structure and renders the core
 * TextAnalyzer component that handles text analysis functionality.
 */

// Import React library for component functionality
import React from "react";

// Import the TextAnalyzer component that handles text analysis features
import TextAnalyzer from "./components/TextAnalyzer";

/**
 * App Component - Main application container
 * 
 * Renders the primary application layout with:
 * - Centered container with responsive design
 * - Application title
 * - Main TextAnalyzer functionality
 * 
 * @returns {JSX.Element} The main application structure
 */
function App() {
  return (
    // Main container with centered layout and responsive design
    // maxWidth: constrains content width for better readability
    // margin: centers the container horizontally
    // padding: provides spacing around content
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      {/* Application title header */}
      <h1>Text Analyzer</h1>
      
      {/* Main text analysis component that handles user input and API integration */}
      <TextAnalyzer />
    </div>
  );
}

// Export App component as default export for use in index.js
export default App;
