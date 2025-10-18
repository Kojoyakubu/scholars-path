// server/services/aiService.js

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- Initialization ---

// Fail fast if the API key is missing
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration for the generative model
const modelConfig = {
  // Use a stable, recent model. Default to 'gemini-1.5-flash-latest' if not specified.
  model: process.env.GEMINI_MODEL_NAME || 'gemini-2.5-pro',
  // Configuration to reduce the chances of the AI blocking legitimate educational content.
  // Adjust these settings based on observed API behavior.
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
};

const model = genAI.getGenerativeModel(modelConfig);


// --- Core Generation Function ---

/**
 * A robust wrapper for the Gemini API call.
 * @param {string} prompt The complete prompt to send to the AI.
 * @returns {Promise<string>} The generated text content.
 */
const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if the response was blocked by safety settings or returned no text
    if (!response || !response.text) {
      console.warn('Gemini API response was empty or blocked.', response);
      throw new Error('The AI failed to generate a response. This may be due to safety filters.');
    }

    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Re-throw a user-friendly error to be caught by the controller's error handler
    throw new Error('An error occurred while generating AI content.');
  }
};


// --- Specific Use-Case Functions ---

/**
 * Generates a well-structured Ghanaian lesson note.
 * @param {object} details - An object containing all necessary details for the lesson note.
 * @returns {Promise<string>} The generated markdown content for the lesson note.
 */
const generateGhanaianLessonNote = async (details) => {
  // Normalize indicator codes from array to string if necessary
  const indicatorCodes = Array.isArray(details.indicatorCodes)
    ? details.indicatorCodes.join(', ')
    : details.indicatorCodes;

  // This prompt is now the single source of truth for lesson note generation.
  const prompt = `
You are an expert Ghanaian teacher and curriculum developer. Generate a complete and well-structured lesson note in Markdown format based on the details provided.

**Lesson Details:**
- School: ${details.school}
- Class: ${details.className}
- Subject: ${details.subjectName}
- Strand: ${details.strandName}
- Sub-Strand: ${details.subStrandName}
- Week: ${details.week}
- Day/Date: ${details.dayDate}
- Term: ${details.term}
- Class Size: ${details.classSize || 45}
- Duration: ${details.duration}
- Content Standard Code: ${details.contentStandardCode}
- Indicator Code(s): ${indicatorCodes}
- Reference Material: ${details.reference}

**Instructions:**
1.  Based on the "Day/Date", calculate and fill in the "Week Ending" date (which should be the Friday of that week).
2.  Based on the "Indicator Code(s)", write a clear, concise "Performance Indicator".
3.  Suggest relevant "Core Competencies" (e.g., Critical Thinking, Digital Literacy).
4.  Suggest realistic "Teaching & Learning Materials" (TLMs).
5.  Fill out all three phases of the lesson plan (Starter, Main, Plenary) with practical, engaging activities suitable for a Ghanaian classroom. The Main phase must include at least two learner activities and a short evaluation with 2-3 questions.
6.  The final output must be only the Markdown content, strictly following the official lesson note structure. Do not include any extra explanations.

---
[BEGIN LESSON NOTE]
---
`;

  return generateContent(prompt);
};

/**
 * Simplifies a teacher's lesson note for learners.
 * @param {string} teacherContent - The original markdown content of the teacher's note.
 * @returns {Promise<string>} A simplified, learner-friendly markdown version.
 */
const generateLearnerFriendlyNote = async (teacherContent) => {
  const prompt = `
Analyze the following teacher's lesson note. Your task is to transform it into a simplified, engaging, and easy-to-understand summary for the students.

**Guidelines:**
- Use simple language, short sentences, and a friendly, encouraging tone.
- Focus on the key learning points from the "Main (New Learning & Assessment)" phase.
- Extract the main concepts and activities.
- Present the information with clear headings, bullet points, and bold keywords.
- Ignore teacher-specific information like "School," "Duration," "Core Competencies," etc.
- The output should be pure Markdown.

**Teacher's Note:**
${teacherContent}

---
[BEGIN LEARNER'S NOTE]
---
`;

  return generateContent(prompt);
};


module.exports = {
  generateContent,
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
};