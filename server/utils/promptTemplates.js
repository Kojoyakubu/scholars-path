// backend/utils/promptTemplates.js

/**
 * @desc    Creates the AI prompt for generating a lesson note.
 * @param   {object} data - The data to inject into the prompt.
 * @returns {string} The fully formatted prompt string.
 */
const createLessonNotePrompt = (data) => {
  // Normalize indicator codes to a string if they are an array
  const codes = Array.isArray(data.indicatorCodes)
    ? data.indicatorCodes.join(', ')
    : data.indicatorCodes;

  // The main prompt template
  return `
You are a Ghanaian master teacher and curriculum expert.
Generate a **well-structured Markdown lesson note** following the exact layout below.

Guidelines:
- Use the provided details faithfully.
- Generate a clear **Performance Indicator** based on the indicator code(s).
- Keep the tone Ghanaian and classroom-appropriate.

---

### TEACHER INFORMATION

**School:** ${data.school}  
**Class:** ${data.className}  
**Subject:** ${data.subjectName}  
**Strand:** ${data.strandName}  
**Sub-Strand:** ${data.subStrandName}  
**Week:** ${data.week}  
**Week Ending:** ${data.weekEnding}  
**Day/Date:** ${data.dayDate}  
**Term:** ${data.term}  
**Class Size:** ${data.classSize || 45}  
**Time/Duration:** ${data.duration}  
**Content Standard (Code):** ${data.contentStandardCode}  
**Indicator Code(s):** ${codes}  
**Performance Indicator:** [AI to generate based on the indicator code(s)]  
**Core Competencies:** Select relevant ones (e.g., Communication, Collaboration, Critical Thinking, Digital Literacy).  
**Teaching & Learning Materials:** Suggest realistic materials relevant to the subject.  
**Reference:** ${data.reference}

---

### LESSON PHASES (Maintain this 3-column format)

| **PHASE 1: Starter (Preparing the Brain for Learning)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|----------------------------------------------------------|--------------------------------------------------|----------------------------------|
| Begin with recap or warm-up linked to prior knowledge.<br><br>Engage learners through questions or short tasks.<br><br>Introduce today’s lesson clearly. | **Activity 1:** Introduce the concept via discussion/demonstration.<br><br>**Activity 2:** Learners explore and practice through guided/group tasks.<br><br>**Activity 3:** Discuss findings and summarize key learning points.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:** Give a short reflective task linked to real-life application. | Recap the key ideas.<br><br>Allow learners to share what they learned.<br><br>Encourage application and further practice. |

---

**Facilitator:** **Vetted By:** ....................................................  
**Signature:** ....................................................  
**Date:** ....................................................  

---

**Rules for Output:**
- Format only in Markdown (no code blocks).
- Do not omit or rename any heading.
- Replace all [AI to ...] placeholders with actual content.
`;
};

module.exports = {
  createLessonNotePrompt,
};