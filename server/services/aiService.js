// /server/services/aiService.js

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- Initialization ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ GEMINI_API_KEY is missing in environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Model Configuration ---
const modelConfig = {
  model: 'gemini-2.5-pro',
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
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string.');
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2, // Lower value for less randomness and more predictability.
      },
    });
    
    const response = await result.response;
    const text = response?.text?.();
    
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
    classSize = '[Class size]',
    reference = '[Reference]',
    contentStandardCode = '[Content Standard Code]',
    indicatorCodes = [],
    dayDate = '[Day/Date]',
  } = details;

  const officialIndicatorText = indicatorCodes || '[Official Indicator Text]';

  const prompt = `
You are a Ghanaian master teacher and curriculum expert.

Generate a **professionally formatted Markdown lesson note** following this exact structure and tone.

Follow these rules:
- The 'TEACHER INFORMATION' section MUST be formatted as a two-column layout, with each item on a new line.
- Use the "Transformation Logic" below to convert the "Official NaCCA Indicator" into a learner-centric "Performance Indicator".
- ✅ **NEW RULE: For the 'LESSON PHASES' table, make the middle column (Phase 2) significantly wider than Phase 1 and Phase 3.**
- Fill in all other details faithfully from the information provided.
- Everything should left alligned
- Derive **Week Ending (Friday date)** from the given "Day/Date".
- **CRITICAL RULE: Do not add any introductory sentences. Start the response directly with the '### TEACHER INFORMATION' heading.**

---
### Transformation Logic (Example)
- **IF the user provides this Indicator:** "Discuss the fourth-generation computers"
- **THEN you must generate this Performance Indicator:** "The learner can identify the features of fourth-generation computers."
---

### TEACHER INFORMATION

**School:** ${school}
**Term:** ${term}
**Week:** ${week}
**Week Ending:** [AI to compute Friday date based on ${dayDate}]
**Class:** ${className}
**Class Size:** ${classSize}
**Strand:** ${strandName}
**Sub-Strand:** ${subStrandName}
**Day/Date:** ${dayDate}
**Time/Duration:** ${duration}
**Content Standard (Code):** ${contentStandardCode}
**Indicator(s):** ${officialIndicatorText}
**Performance Indicator:** [AI to generate a new 2-3 indicator using the Transformation Logic above]
**Core Competencies:** Select 3–4 relevant ones (e.g., Communication, Collaboration, Critical Thinking).
**Teaching & Learning Materials:** Suggest realistic and accessible materials.
**Reference:** ${reference}

---

| **PHASE 1: Starter (Preparing the Brain)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|:---|:---:|---:|
| Start with recap or warm-up linked to prior learning.<br><br>Engage learners with short activities or questions.<br><br>Introduce today’s lesson clearly. | **Activity 1:** Introduce concept through discussion or demonstration.<br><br>**Activity 2:** Learners engage in group/practical tasks.<br><br>**Activity 3:** Discuss findings and summarize main points.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:** Short reflective task linking to real-life. | Recap key learning points.<br><br>Allow learners to share reflections.<br><br>Encourage real-life application and continuous practice. |

---

**Facilitator:** ..................................................
<br><br>
**Vetted By:** ....................................................
<br><br>
**Signature:** ....................................................
<br><br>
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
  if (!teacherContent || typeof teacherContent !== 'string') {
    throw new Error('Teacher content must be a non-empty string.');
  }

  const prompt = `
Transform the following teacher's lesson note into a **learner-friendly summary**.

Guidelines:
- Use simple Ghanaian English suitable for Basic school learners.
- Use bullet points and a friendly tone.
- Highlight only key learning points.

**Teacher's Lesson Note:**
${teacherContent}
`;

  return generateContent(prompt);
};

module.exports = {
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
};