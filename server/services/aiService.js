const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the generative AI model with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5 flash' });

/**
 * Generates content using the Gemini model.
 * @param {string} prompt - The prompt to send to the AI.
 * @returns {Promise<string>} The generated text.
 */
const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate AI content.');
  }
};

module.exports = { generateContent };