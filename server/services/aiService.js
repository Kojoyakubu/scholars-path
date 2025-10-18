// /server/services/aiService.js (Final Version)

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- Initialization ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Model Configuration ---
const modelConfig = {
  model: 'gemini-1.5-flash',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
};

const model = genAI.getGenerativeModel(modelConfig);

/**
 * Generates AI content safely and handles all Gemini-related errors.
 * @param {string} prompt - The complete instruction for the AI.
 * @returns {Promise<string>} - Generated text output.
 */
const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response?.text();
    if (!text) {
      console.warn('⚠️ Gemini API returned no text or content was blocked.');
      throw new Error('The AI failed to generate a response. Please try rephrasing or simplifying your input.');
    }

    return text.trim();
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    throw new Error(error.message || 'Unknown error occurred while generating AI content.');
  }
};

/**
 * Generates a structured Ghanaian lesson note.
 * @param {object} details - Lesson details provided by the teacher.
 * @returns {Promise<string>} - Generated Markdown lesson note.
 */
const generateGhanaianLessonNote = async (details = {}) => {
  const {
    school = '[School Name]',
    className = '[Class]',
    subjectName = '[Subject]',
    strandName = '[Strand]',
    subStrandName = '[Sub-Strand]',
    week = '[Week]',
    term = '[Term]',
    duration = '[Duration]',
    classSize = 45,
    reference = '[Reference]',
    contentStandardCode = '[Content Standard Code]',
    indicatorCodes = [],
    dayDate = '[Day/Date]',
  } = details;

  const codes = Array.isArray(indicatorCodes) ? indicatorCodes.join(', ') : indicatorCodes || '[Indicator Code]';

  const prompt = `You are a Ghanaian master teacher and curriculum expert. Generate a professionally formatted Markdown lesson note following this exact structure and tone.

Follow these rules:
- Use the details provided below faithfully.
- Generate a realistic Performance Indicator from the indicator code(s).
- Derive Week Ending (Friday date) from the given "Day/Date".
- Replace all placeholders like [AI to ...] with real content.
- **CRITICAL RULE: Do not add any introductory sentences or preambles. Start the response directly with the '### TEACHER INFORMATION' heading.**

---

### TEACHER INFORMATION

**School:** ${school}
**Class:** ${className}
**Subject:** ${subjectName}
**Strand:** ${strandName}
**Sub-Strand:** ${subStrandName}
**Week:** ${week}
**Week Ending:** [AI to compute Friday date based on ${dayDate}]
**Day/Date:** ${dayDate}
**Term:** ${term}
**Class Size:** ${classSize}
**Time/Duration:** ${duration}
**Content Standard (Code):** ${contentStandardCode}
**Indicator Code(s):** ${codes}
**Performance Indicator:** [AI to generate from indicator code(s)]
**Core Competencies:** Select 3–4 relevant ones (e.g., Communication, Collaboration, Critical Thinking, Digital Literacy).
**Teaching & Learning Materials:** Suggest realistic and accessible materials.
**Reference:** ${reference}

---

### LESSON PHASES (3-Column Format)

| **PHASE 1: Starter (Preparing the Brain)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|---|---|---|
| Start with recap or warm-up linked to prior learning.<br><br>Engage learners with short activities or questions.<br><br>Introduce today’s lesson clearly. | **Activity 1:** Introduce concept through discussion or demonstration.<br><br>**Activity 2:** Learners engage in group/practical tasks.<br><br>**Activity 3:** Discuss findings and summarize main points.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:** Short reflective task linking to real-life. | Recap key learning points.<br><br>Allow learners to share reflections.<br><br>Encourage real-life application and continuous practice. |

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
 * Converts a teacher's lesson note into a learner-friendly summary.
 * @param {string} teacherContent - The full teacher's lesson note.
 * @returns {Promise<string>} - Simplified learner version.
 */
const generateLearnerFriendlyNote = async (teacherContent) => {
  const prompt = `
Transform the following teacher's lesson note into a learner-friendly summary.

Guidelines:
- Use simple Ghanaian English suitable for Basic school learners.
- Use bullet points and a friendly tone.
- Highlight only key learning points.
- **CRITICAL RULE: Do not add any introductory text. Start directly with the first heading of the learner's note.**

**Teacher's Lesson Note:**
${teacherContent}

---

[BEGIN LEARNER’S NOTE]
---
`;

  return generateContent(prompt);
};

module.exports = {
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
};