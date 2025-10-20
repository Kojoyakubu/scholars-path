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
- **Make sure the lesson phase has these proportions. columnStyles: {
              0: { columnWidth: '25%' }, // Phase 1
              1: { columnWidth: '50%' }, // Phase 2 (wider)
              2: { columnWidth: '25%' }, // Phase 3

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
**Subject:** ${subjectName}
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
| **Recap of Previous Lesson:** Briefly review prior knowledge relevant to today's topic.<br><br>**Engaging Activity:** A short, interactive task or question to capture learners' interest.<br><br>**Introduction of Lesson:** Clearly state the objective for the lesson. | **Activity 1: Introduction of Concept:** Introduce the main topic using a suitable method (e.g., demonstration, discussion, storytelling).<br><br>**Activity 2: Learner-Centered Activity:** Design a practical task for learners to apply the new knowledge. **This can be individual work, pair work, or group work, whichever is most appropriate for the topic.**<br><br>**Evaluation:** Ask 2-3 short questions to check for understanding.<br><br>**Assignment:** Give a short, relevant take-home task. | **Recap of Key Points:** Briefly summarize the most important ideas from the lesson.<br><br>**Learner Reflection:** Ask questions to help learners reflect on what they learned.<br><br>**Real-Life Application:** Link the lesson to everyday life. |
---

<h5>
Facilitator: ..................................................
<br><br>
Vetted By: ....................................................
<br><br>
Signature: ....................................................
<br><br>
Date: ....................................................
</h5>
---
`;

  return generateContent(prompt);
};

/**
 * ✅ NEW AND IMPROVED LEARNER NOTE FUNCTION
 * Converts a teacher's lesson note into a detailed study note for students.
 * @param {string} teacherContent - The full teacher's lesson note.
 * @returns {Promise<string>} - Simplified but detailed learner version.
 */
const generateLearnerFriendlyNote = async (teacherContent) => {
  if (!teacherContent || typeof teacherContent !== 'string') {
    throw new Error('Teacher content must be a non-empty string.');
  }

  const prompt = `
You are a friendly Ghanaian teacher creating a study note for a Junior High School student. Your task is to transform the formal teacher's lesson note below into a detailed but easy-to-understand study guide.

**Guidelines:**
1.  **Extract the Topic:** Identify the main Sub-Strand from the teacher's note and use it as the main heading (e.g., "## Components of Computers").
2.  **Explain in Detail:** Do not just summarize. Read the 'Phase 2: Main Learning' section of the teacher's note and explain the key concepts in detail. Use simple language and provide clear definitions and examples.
3.  **Structure:** Use Markdown for structure. Use subheadings (\###\), bullet points (`*`), and bold text (`**word**`) to organize the information.
4.  **Engage the Learner:** At the end of the note, add a section called "✍️ **Check Your Understanding**" with one or two simple questions based on the note to help the student review.
5.  **CRITICAL RULE:** Do not add any conversational introductions like "Hello!" or "Here is the note...". Start the note directly with the main heading.

**Teacher's Lesson Note to Transform:**
---
${teacherContent}
---
`;

  return generateContent(prompt);
};

module.exports = {
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
};