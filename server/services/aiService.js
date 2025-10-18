// /server/services/aiService.js

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- Initialization ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration for the generative model
const modelConfig = {
  // Use the corrected model name for Gemini
  model: 'gemini-2.5-pro',
  // Relax safety settings to prevent legitimate educational content from being blocked
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
};

const model = genAI.getGenerativeModel(modelConfig);

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
    if (!response || !response.text()) {
      console.warn('Gemini API response was empty or blocked.', response);
      throw new Error('The AI failed to generate a response, likely due to safety filters blocking the content. Please try rephrasing your input.');
    }

    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw new Error(error.message || 'An unknown error occurred while generating AI content.');
  }
};

/**
 * Generates a well-structured Ghanaian lesson note using your specific prompt format.
 */
const generateGhanaianLessonNote = async (details) => {
  // Normalize the indicator codes from an array to a string
  const codes = Array.isArray(details.indicatorCodes)
    ? details.indicatorCodes.join(', ')
    : details.indicatorCodes;

  // The entire set of instructions and the template is a single prompt for Gemini.
  const prompt = `You are a Ghanaian master teacher and curriculum expert.
Generate a **well-structured Markdown lesson note** following the exact layout below.

Guidelines:
- Use the provided details faithfully.
- Generate a clear **Performance Indicator** based on the indicator code(s).
- Determine **Week Ending (Friday date)** based on the given "Day/Date".
- Keep the tone Ghanaian and classroom-appropriate.
- Replace all placeholders like [AI to ...] with actual, relevant content.

---

### TEACHER INFORMATION

**School:** ${details.school}
**Class:** ${details.className}
**Subject:** ${details.subjectName}
**Strand:** ${details.strandName}
**Sub-Strand:** ${details.subStrandName}
**Week:** ${details.week}
**Week Ending:** [AI to calculate Friday date based on ${details.dayDate}]
**Day/Date:** ${details.dayDate}
**Term:** ${details.term}
**Class Size:** ${details.classSize || 45}
**Time/Duration:** ${details.duration}
**Content Standard (Code):** ${details.contentStandardCode}
**Indicator Code(s):** ${codes}
**Performance Indicator:** [AI to generate based on the indicator code(s)]
**Core Competencies:** Select relevant ones (e.g., Communication, Collaboration, Critical Thinking, Digital Literacy).
**Teaching & Learning Materials:** Suggest realistic materials relevant to the subject.
**Reference:** ${details.reference}

---

### LESSON PHASES (Maintain this 3-column format)

| **PHASE 1: Starter (Preparing the Brain for Learning)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|---|---|---|
| Begin with recap or warm-up linked to prior knowledge.<br><br>Engage learners through questions or short tasks.<br><br>Introduce today’s lesson clearly. | **Activity 1:** Introduce the concept via discussion/demonstration.<br><br>**Activity 2:** Learners explore and practice through guided/group tasks.<br><br>**Activity 3:** Discuss findings and summarize key learning points.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:** Give a short reflective task linked to real-life application. | Recap the key ideas.<br><br>Allow learners to share what they learned.<br><br>Encourage application and further practice. |

---

**Facilitator:**
**Vetted By:** ....................................................
**Signature:** ....................................................
**Date:** ....................................................

---
`;

  return generateContent(prompt);
};

/**
 * Simplifies a teacher's lesson note for learners.
 */
const generateLearnerFriendlyNote = async (teacherContent) => {
  const prompt = `
Analyze the following teacher's lesson note. Transform it into a simplified, engaging, and easy-to-understand summary for the students. Use simple language, short sentences, and a friendly tone with clear headings and bullet points. Focus on the key learning points.

**Teacher's Note:**
${teacherContent}

---
[BEGIN LEARNER'S NOTE]
---
`;

  return generateContent(prompt);
};

module.exports = {
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
};