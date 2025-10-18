// /server/services/aiService.js (OpenAI Version)

const OpenAI = require('openai');

// --- Initialization ---
if (!process.env.OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is missing in environment variables.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * A robust wrapper for the OpenAI API call.
 * @param {string} systemMessage - The instruction that defines the AI's role and context.
 * @param {string} userPrompt - The user's specific request or data.
 * @returns {Promise<string>} The generated text content from the AI.
 */
const generateContent = async (systemMessage, userPrompt) => {
  if (!userPrompt || typeof userPrompt !== 'string') {
    throw new Error('User prompt must be a non-empty string.');
  }

  try {
    const response = await openai.chat.completions.create({
      // You can use "gpt-4o", "gpt-4-turbo", or "gpt-3.5-turbo"
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5, // Lower value = more predictable, less creative
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('The AI failed to generate a response. The response was empty.');
    }

    return content.trim();
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    throw new Error(error.message || 'Unknown error occurred while generating AI content.');
  }
};

/**
 * Generates a structured Ghanaian lesson note using OpenAI.
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

  const systemMessage = `You are a Ghanaian master teacher and curriculum expert.
Generate a **professionally formatted Markdown lesson note** following the exact structure and tone provided by the user.

Follow these rules:
- Use the details provided faithfully.
- Generate a realistic **Performance Indicator** from the indicator code(s).
- Derive **Week Ending (Friday date)** from the given "Day/Date".
- Do not include placeholders like [AI to ...]; replace them with real content.
- **CRITICAL RULE: Do not add any introductory sentences or preambles. Start the response directly with the '### TEACHER INFORMATION' heading.**`;

  const userPrompt = `
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

| **PHASE 1: Starter (Preparing the Brain)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|---|---|---|
| Start with recap or warm-up linked to prior learning.<br><br>Engage learners with short activities or questions.<br><br>Introduce today’s lesson clearly. | **Activity 1:** Introduce concept through discussion or demonstration.<br><br>**Activity 2:** Learners engage in group/practical tasks.<br><br>**Activity 3:** Discuss findings and summarize main points.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:** Short reflective task linking to real-life. | Recap key learning points.<br><br>Allow learners to share reflections.<br><br>Encourage real-life application and continuous practice. |

---

**Facilitator:** ..................................................
**Vetted By:** ....................................................
**Signature:** ....................................................
**Date:** ....................................................

---
`;

  return generateContent(systemMessage, userPrompt);
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

  const systemMessage = `Transform the following teacher's lesson note into a **learner-friendly summary**.

Guidelines:
- Use simple Ghanaian English suitable for Basic school learners.
- Use short, clear sentences, bullet points, and a friendly tone.
- Highlight only key learning points and definitions.`;

  const userPrompt = `
**Teacher's Lesson Note:**
${teacherContent}
`;

  return generateContent(systemMessage, userPrompt);
};

module.exports = {
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
};