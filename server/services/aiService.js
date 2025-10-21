// /server/services/aiService.js

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- Initialization ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ GEMINI_API_KEY is missing in environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Model Configuration ---
const modelConfig = {
  model: 'gemini-2.5-pro', // Using the model you confirmed works
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
        temperature: 0.4, // Slightly higher temp for more creative visual suggestions
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
 * Generates a structured Ghanaian lesson note for teachers.
 * (This function remains unchanged)
 */
const generateGhanaianLessonNote = async (details = {}) => {
  const {
    school, className, subjectName, strandName, subStrandName, week,
    term, duration, classSize, reference, contentStandardCode,
    indicatorCodes, dayDate
  } = details;

  const officialIndicatorText = indicatorCodes || '[Official Indicator Text]';

  const prompt = `
You are a Ghanaian master teacher and curriculum expert. Generate a professionally formatted Markdown lesson note.

Follow these rules STRICTLY:
1.  **Layout:** The 'TEACHER INFORMATION' section must be a two-column layout with left-aligned text.
2.  **Transformation:** Use the "Transformation Logic" to convert the "Official NaCCA Indicator" into a learner-centric "Performance Indicator".
3.  **Table Proportions:** For the 'LESSON PHASES' table, make the middle column (Phase 2) much wider than Phase 1 and Phase 3 (roughly 25% | 50% | 25%).
4.  **Dates:** Derive the **Week Ending (Friday date)** from the user's "Day/Date".
5.  **No Filler:** Do not add any introductory sentences. Start the response directly with the '### TEACHER INFORMATION' heading.

---
### Transformation Logic (Example)
- **IF Official Indicator is:** "Discuss the fourth-generation computers"
- **THEN Performance Indicator must be:** "The learner can identify the features of fourth-generation computers."
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
**Performance Indicator:** [AI to generate 2-3 new indicators using the Transformation Logic]
**Core Competencies:** Select 3–4 relevant ones.
**Teaching & Learning Materials:** Suggest realistic materials.
**Reference:** ${reference}

---

| **PHASE 1: Starter (Preparing the Brain)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|:---|:---:|---:|
| **Recap:** Review prior knowledge.<br><br>**Engaging Activity:** A short task to capture interest.<br><br>**Introduction:** State the lesson's objective. | **Activity 1:** Introduce the main topic.<br><br>**Activity 2:** Design a practical task (individual, pair, or group work).<br><br>**Evaluation:** Ask 2-3 short questions.<br><br>**Assignment:** Give a short take-home task. | **Recap:** Summarize key ideas.<br><br>**Learner Reflection:** Ask questions to help learners reflect.<br><br>**Real-Life Application:** Link the lesson to everyday life. |

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
 * ✅ NEW AND IMPROVED LEARNER NOTE FUNCTION
 * Converts a teacher's lesson note into a detailed, visually-enhanced study note.
 */
const generateLearnerFriendlyNote = async (teacherContent) => {
  if (!teacherContent || typeof teacherContent !== 'string') {
    throw new Error('Teacher content must be a non-empty string.');
  }

  const prompt = `
You are a friendly Ghanaian teacher creating a rich, multimedia study note for a Ghanaian student. Transform the formal teacher's lesson note below into a detailed and engaging study guide.

**Guidelines:**
1.  **Class:** Identify the class and tailor the notes to the Class.
2.  **Topic:** Identify the main Sub-Strand and use it as the main heading.
3.  **Detailed Explanations:** Do not just summarize. Read the 'Phase 2: Main Learning' section and explain the key concepts in detail with simple language, definitions, and examples.
4.  **Visuals:**
    * **Image:** If an image would help explain a concept(e.g stages of human growth), insert the image with a placeholder in the text like this: **[image of the stages of human growth]**.
    * **Diagrams:** If a diagram would help explain a concept (e.g., parts of a computer, a food web), insert the diagram with a placeholder in the text like this: **[Diagram of a computer system showing input, process, and output]**.
    * **Videos:** Find and embed a link to one relevant, high-quality educational YouTube video that explains the main topic. Format it like this: **[Watch a Video: How Computers Work](https://www.youtube.com/watch?v=....)**.
5.  **Structure:** Use Markdown for structure (subheadings, bullet points, bold text).
6.  **Engagement:** At the end, add a section called "✍️ **Check Your Understanding**" with two simple questions.
7.  **CRITICAL RULE:** Start the note directly with the main heading. Do not add any conversational introductions.

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