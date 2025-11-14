// /server/services/aiService.js

/**
 * Multi-AI Service for Scholars-Path
 * - Routes tasks to Gemini, OpenAI, or (optionally) Claude.
 * - Adds JSON validation, robust error handling, and task metadata.
 * - Auto-selects faster/cheaper models for light tasks (e.g., quizzes).
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const OpenAI = require('openai');

// Optional Claude (only if installed)
let Anthropic = null;
try {
  // eslint-disable-next-line global-require
  Anthropic = require('anthropic');
} catch (_) {
  // Claude is optional; ignore if not installed.
}

// ---- Environment Checks ----
const hasGemini = !!process.env.GEMINI_API_KEY;
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasClaude = !!process.env.ANTHROPIC_API_KEY && !!Anthropic;

if (!hasGemini && !hasOpenAI && !hasClaude) {
  throw new Error('No AI providers configured. Set at least one of GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.');
}

// ---- Clients ----
const gemini = hasGemini ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = hasOpenAI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const claude = hasClaude ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// ---- Default Model Choices (override via env if you like) ----
const GEMINI_MAIN = process.env.GEMINI_MODEL_MAIN || 'gemini-2.5-pro';
const GEMINI_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-2.5-flash';
const OPENAI_MAIN = process.env.OPENAI_MODEL_MAIN || 'gpt-4o';
const OPENAI_JSON = process.env.OPENAI_MODEL_JSON || 'gpt-4o-mini';
const CLAUDE_MAIN = process.env.CLAUDE_MODEL_MAIN || 'claude-3-5-sonnet-20240620';

// ---- Utilities ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractJson(text) {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*([\s\S]*?)\s*```$/i, '$1').trim();
  cleaned = cleaned.replace(/^```\s*([\s\S]*?)\s*```$/i, '$1').trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const startIdx = [firstBrace, firstBracket].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (startIdx > 0) cleaned = cleaned.slice(startIdx);
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);
  if (endIdx > 0 && endIdx < cleaned.length - 1) cleaned = cleaned.slice(0, endIdx + 1);
  return cleaned.trim();
}

function parseJsonStrict(text) {
  const cleaned = extractJson(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const preview = cleaned.slice(0, 400);
    throw new Error(`Invalid JSON from AI. Preview:\n${preview}`);
  }
}

function pickProvider({ task = 'generic', jsonNeeded = false, preferredProvider }) {
  if (preferredProvider) return preferredProvider.toLowerCase();
  if (jsonNeeded || /quiz/i.test(task)) {
    if (hasOpenAI) return 'openai';
    if (hasGemini) return 'gemini';
    if (hasClaude) return 'claude';
  }
  if (/lesson|learner|note|explain/i.test(task)) {
    if (hasGemini) return 'gemini';
    if (hasOpenAI) return 'openai';
    if (hasClaude) return 'claude';
  }
  if (hasOpenAI) return 'openai';
  if (hasGemini) return 'gemini';
  if (hasClaude) return 'claude';
  throw new Error('No AI providers available.');
}

async function generateTextCore({
  prompt,
  task = 'generic',
  temperature = 0.4,
  jsonNeeded = false,
  preferredProvider,
  providerModelOverride,
}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string.');
  }
  const provider = pickProvider({ task, jsonNeeded, preferredProvider });
  let modelUsed = '';
  let text = '';
  let raw = null;
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      if (provider === 'gemini') {
        if (!gemini) throw new Error('Gemini not configured.');
        const modelName = providerModelOverride || (jsonNeeded || /quiz/i.test(task) ? GEMINI_FAST : GEMINI_MAIN);
        const model = gemini.getGenerativeModel({
          model: modelName,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ],
        });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature },
        });
        const response = await result.response;
        text = response?.text?.() || '';
        raw = response;
        modelUsed = `Gemini:${modelName}`;
      }
      if (provider === 'openai') {
        if (!openai) throw new Error('OpenAI not configured.');
        const modelName = providerModelOverride || (jsonNeeded || /quiz/i.test(task) ? OPENAI_JSON : OPENAI_MAIN);
        const resp = await openai.chat.completions.create({
          model: modelName,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        });
        text = resp?.choices?.[0]?.message?.content || '';
        raw = resp;
        modelUsed = `OpenAI:${modelName}`;
      }
      if (provider === 'claude') {
        if (!claude) throw new Error('Claude not configured.');
        const modelName = providerModelOverride || CLAUDE_MAIN;
        const resp = await claude.messages.create({
          model: modelName,
          temperature,
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        });
        const parts = Array.isArray(resp?.content) ? resp.content.map((c) => c?.text || '').filter(Boolean) : [];
        text = parts.join('\n').trim();
        raw = resp;
        modelUsed = `Claude:${modelName}`;
      }
      if (!text) {
        throw new Error('AI returned empty response.');
      }
      return {
        ok: true,
        text: text.trim(),
        provider,
        model: modelUsed,
        task,
        timestamp: Date.now(),
        raw,
      };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        throw new Error(`[${provider}] ${err.message || 'Unknown AI error'}`);
      }
      await sleep(250 * (attempt + 1));
    }
  }
  throw new Error('AI generation failed after retries.');
}

// ========================
// High-level task helpers
// ========================

// ✅ ====================================================================
// ✅ ADD THIS NEW FUNCTION TO FIX THE ERROR
// ✅ ====================================================================
/**
 * Generate a personalized insight for the landing page.
 */
async function getLandingInsights(details = {}) {
  const { role = 'user', name = 'User' } = details;

  let prompt;
  if (role === 'admin' || role === 'school_admin') {
    prompt = `You are an AI assistant for Scholar's Path. The admin, ${name}, just logged in. Provide a short, encouraging, and insightful message (2-3 sentences) about the platform's potential for improving educational outcomes in Ghana. Mention something about data-driven decisions.`;
  } else if (role === 'teacher') {
    prompt = `You are an AI assistant for Scholar's Path. The teacher, ${name}, just logged in. Provide a short, welcoming, and inspiring message (2-3 sentences). Suggest they could try generating a new quiz or lesson plan to save time.`;
  } else {
    prompt = `You are an AI assistant for Scholar's Path. The user, ${name}, just logged in. Provide a short, positive, and motivating message (2-3 sentences) about their learning journey.`;
  }

  const { text } = await generateTextCore({
    prompt,
    task: 'insight',
    temperature: 0.6,
  });

  return text;
}

/**
 * Generate a Ghanaian teacher lesson note (Markdown).
 */
async function generateGhanaianLessonNote(details = {}) {
  const { school, className, subjectName, strandName, subStrandName, week, term, duration, classSize, reference, contentStandardCode, indicatorCodes, dayDate, preferredModel, preferredProvider } = details;
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
**  Teaching & Learning Materials:** Suggest realistic materials.
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
`;
  const { text, provider, model, timestamp } = await generateTextCore({ prompt, task: 'lessonNote', temperature: 0.4, preferredProvider, providerModelOverride: preferredModel });
  return { text, provider, model, task: 'lessonNote', timestamp };
}

/**
 * Transform a teacher lesson note into a learner-friendly study note (Markdown).
 */
async function generateLearnerFriendlyNote(teacherContent, opts = {}) {
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
    * **Image:** If an image would help explain a concept, insert a placeholder using this exact format: **[image: A concise search query for the image]**.
    * **Diagrams:** If a diagram would help, insert: **[DIAGRAM: concise diagram idea]**.
    * **Videos:** Include one relevant YouTube link formatted as: **[Watch a Video: Title](https://www.youtube.com/...)**.
5.  **Structure:** Use Markdown (headings, bullet points, bold).
6.  **Engagement:** End with "✍️ **Check Your Understanding**" and two simple questions.
7.  **CRITICAL RULE:** Start directly with the main heading—no introductions.
**Teacher's Lesson Note:**
---
${teacherContent}
---`;
  const { text, provider, model, timestamp } = await generateTextCore({ prompt, task: 'learnerNote', temperature: 0.45, preferredProvider: opts.preferredProvider, providerModelOverride: opts.preferredModel });
  return { text, provider, model, task: 'learnerNote', timestamp };
}

/**
 * Generate WAEC-style multiple-choice quiz questions in strict JSON.
 */
async function generateWaecQuiz(details = {}) {
  const { topic, className, subjectName, numQuestions = 5, preferredProvider, preferredModel } = details;
  const prompt = `
You are an expert WAEC examiner in Ghana for ${subjectName} (${className} level).
Generate a multiple-choice quiz on the topic: "${topic}".
Rules:
- Number of questions: ${numQuestions}
- Each question must have four options (A, B, C, D).
- Indicate the correct answer.
- Return ONLY valid JSON: an array of objects.
- Each object must include:
  - "text": string (question)
  - "options": array of { "text": string, "isCorrect": boolean }
  - (Optional) "explanation": string (short reason)
DO NOT include any commentary—ONLY raw JSON array.
Example:
[
  {
    "text": "Which of these is an input device?",
    "options": [
      { "text": "Monitor", "isCorrect": false },
      { "text": "Keyboard", "isCorrect": true },
      { "text": "Printer", "isCorrect": false },
      { "text": "Speaker", "isCorrect": false }
    ]
  }
]`;
  const { text, provider, model, timestamp } = await generateTextCore({ prompt, task: 'quiz', temperature: 0.2, jsonNeeded: true, preferredProvider, providerModelOverride: preferredModel });
  const parsed = parseJsonStrict(text);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Quiz JSON must be a non-empty array.');
  }
  for (const q of parsed) {
    if (typeof q?.text !== 'string') {
      throw new Error('Each quiz item must have a "text" string field.');
    }
    if (!Array.isArray(q?.options) || q.options.length !== 4) {
      throw new Error('Each quiz item must have exactly 4 options.');
    }
    const hasCorrect = q.options.some((o) => o && typeof o.text === 'string' && typeof o.isCorrect === 'boolean' && o.isCorrect);
    if (!hasCorrect) {
      throw new Error('Each question must have exactly one correct option marked with "isCorrect": true.');
    }
  }
  return { quiz: parsed, provider, model, task: 'quiz', timestamp };
}

// ========================
// 🎓 NEW: HTML-Based Bundle Generation Functions
// ========================

/**
 * Generate NaCCA-compliant Teacher Lesson Note in HTML format.
 * This is for the new "bundle" endpoint that generates everything at once.
 */
async function generateTeacherLessonNoteHTML(details = {}) {
  const { 
    school, 
    className, 
    subjectName, 
    strandName, 
    subStrandName, 
    week, 
    term, 
    duration, 
    classSize, 
    reference, 
    contentStandardCode, 
    indicatorCodes, 
    dayDate, 
    preferredModel, 
    preferredProvider 
  } = details;

  const officialIndicatorText = indicatorCodes || '[Official Indicator Text]';
  
  const prompt = `
You are a Ghanaian master teacher and curriculum expert. Generate a professionally formatted HTML lesson note following Ghana's NaCCA (National Council for Curriculum and Assessment) structure.

CRITICAL RULES:
1. Return ONLY valid HTML - no markdown, no code blocks, no explanations
2. Start directly with HTML tags - no introductory text
3. Use proper HTML tags: <h2>, <h3>, <p>, <table>, <ul>, <li>, <strong>, <br>
4. The layout must be clean, professional, and ready to display in a web browser
5. Use the "Transformation Logic" to convert the "Official NaCCA Indicator" into learner-centric "Performance Indicators"
6. Derive the Week Ending (Friday date) from the provided Day/Date

---
TRANSFORMATION LOGIC EXAMPLE:
- IF Official Indicator: "Discuss the fourth-generation computers"
- THEN Performance Indicator: "The learner can identify the features of fourth-generation computers."
- THEN Another: "The learner can explain the advantages of fourth-generation computers."
---

Generate HTML following this structure:

<div class="lesson-note">
  <h2>Teacher Lesson Note</h2>
  
  <div class="teacher-info">
    <h3>Teacher Information</h3>
    <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td><strong>School:</strong></td>
        <td>${school}</td>
        <td><strong>Term:</strong></td>
        <td>${term}</td>
      </tr>
      <tr>
        <td><strong>Week:</strong></td>
        <td>${week}</td>
        <td><strong>Week Ending:</strong></td>
        <td>[AI: Compute Friday from ${dayDate}]</td>
      </tr>
      <tr>
        <td><strong>Class:</strong></td>
        <td>${className}</td>
        <td><strong>Class Size:</strong></td>
        <td>${classSize}</td>
      </tr>
      <tr>
        <td><strong>Subject:</strong></td>
        <td>${subjectName}</td>
        <td><strong>Day/Date:</strong></td>
        <td>${dayDate}</td>
      </tr>
      <tr>
        <td><strong>Strand:</strong></td>
        <td>${strandName}</td>
        <td><strong>Duration:</strong></td>
        <td>${duration}</td>
      </tr>
      <tr>
        <td colspan="4"><strong>Sub-Strand:</strong> ${subStrandName}</td>
      </tr>
    </table>
  </div>

  <div class="curriculum-standards">
    <h3>Curriculum Standards</h3>
    <p><strong>Content Standard Code:</strong> ${contentStandardCode}</p>
    <p><strong>Official Indicator(s):</strong><br>${officialIndicatorText}</p>
    <p><strong>Performance Indicator(s):</strong><br>[AI: Generate 2-3 learner-centric indicators using Transformation Logic]</p>
    <p><strong>Core Competencies:</strong><br>[AI: List 3-4 relevant NaCCA core competencies]</p>
    <p><strong>Teaching & Learning Materials:</strong><br>[AI: Suggest realistic materials for this topic]</p>
    <p><strong>Reference:</strong> ${reference}</p>
  </div>

  <div class="lesson-phases">
    <h3>Lesson Phases</h3>
    <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="width: 25%;">Phase 1: Starter<br>(Preparing the Brain)</th>
          <th style="width: 50%;">Phase 2: Main<br>(New Learning & Assessment)</th>
          <th style="width: 25%;">Phase 3: Plenary<br>(Reflection)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="vertical-align: top;">
          <td>
            <p><strong>Recap:</strong><br>[AI: Brief review of prior knowledge]</p>
            <p><strong>Engaging Activity:</strong><br>[AI: Short task to capture interest]</p>
            <p><strong>Introduction:</strong><br>[AI: State lesson objective clearly]</p>
          </td>
          <td>
            <p><strong>Activity 1:</strong><br>[AI: Introduce main topic with explanation]</p>
            <p><strong>Activity 2:</strong><br>[AI: Practical task - individual, pair, or group work]</p>
            <p><strong>Evaluation:</strong><br>[AI: 2-3 questions to check understanding]</p>
            <p><strong>Assignment:</strong><br>[AI: Short take-home task]</p>
          </td>
          <td>
            <p><strong>Recap:</strong><br>[AI: Summarize key ideas]</p>
            <p><strong>Learner Reflection:</strong><br>[AI: Questions to help learners reflect]</p>
            <p><strong>Real-Life Application:</strong><br>[AI: Link lesson to everyday Ghanaian life]</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="signatures">
    <p><strong>Facilitator:</strong> ..................................................</p>
    <p><strong>Vetted By:</strong> ..................................................</p>
    <p><strong>Signature:</strong> ..................................................</p>
    <p><strong>Date:</strong> ..................................................</p>
  </div>
</div>

REMEMBER: Return ONLY the HTML above, filled with appropriate content. No markdown, no code fences, no explanations.
`;

  const { text, provider, model, timestamp } = await generateTextCore({ 
    prompt, 
    task: 'teacherLessonNoteHTML', 
    temperature: 0.4, 
    preferredProvider, 
    providerModelOverride: preferredModel 
  });

  return { text, provider, model, task: 'teacherLessonNoteHTML', timestamp };
}

/**
 * Generate Student-Friendly Learner Note in HTML format.
 * Transforms the teacher note into engaging, simple content for learners.
 */
async function generateLearnerNoteHTML(teacherNoteHTML, details = {}) {
  if (!teacherNoteHTML || typeof teacherNoteHTML !== 'string') {
    throw new Error('Teacher note HTML must be provided as a non-empty string.');
  }

  const { subStrandName = 'Topic', className = 'Class' } = details;

  const prompt = `
You are a friendly Ghanaian teacher creating an engaging study note for ${className} students.

Transform the formal teacher's lesson note below into a rich, student-friendly HTML study guide.

CRITICAL RULES:
1. Return ONLY valid HTML - no markdown, no code blocks, no explanations
2. Start directly with HTML tags - no introductory text
3. Use proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <br>
4. Make it engaging and easy to understand for Ghanaian students

GUIDELINES:
1. **Main Heading:** Use "${subStrandName}" as the main topic heading
2. **Detailed Explanations:** Read the teacher's Phase 2 section and explain key concepts in detail with:
   - Simple definitions
   - Clear explanations
   - Local Ghanaian examples (use familiar contexts)
   - Step-by-step breakdowns where needed
3. **Visuals:** 
   - When an image would help, write: <p><em>[Image suggestion: Brief description of helpful image]</em></p>
   - When a diagram would help, write: <p><em>[Diagram: Brief description]</em></p>
4. **Structure:** Use HTML headings (<h2>, <h3>), paragraphs (<p>), lists (<ul>, <li>), and bold/italic for emphasis
5. **Engagement:** End with a "Check Your Understanding" section with 2-3 simple questions
6. **Tone:** Friendly, encouraging, age-appropriate for ${className}

Generate HTML following this structure:

<div class="learner-note">
  <h2>${subStrandName}</h2>
  
  <div class="introduction">
    <p>[AI: Engaging introduction explaining what students will learn]</p>
  </div>

  <div class="main-content">
    <h3>[AI: First Key Concept]</h3>
    <p>[AI: Clear explanation with examples]</p>
    <p><em>[Image suggestion: if helpful]</em></p>
    
    <h3>[AI: Second Key Concept]</h3>
    <p>[AI: Clear explanation with Ghanaian examples]</p>
    <ul>
      <li>[AI: Key point 1]</li>
      <li>[AI: Key point 2]</li>
      <li>[AI: Key point 3]</li>
    </ul>

    [AI: Continue with more concepts as needed]
  </div>

  <div class="practice">
    <h3>✍️ Check Your Understanding</h3>
    <ol>
      <li>[AI: Simple question 1]</li>
      <li>[AI: Simple question 2]</li>
      <li>[AI: Simple question 3 - optional]</li>
    </ol>
  </div>

  <div class="real-life">
    <h3>🌍 In Real Life</h3>
    <p>[AI: How this topic relates to everyday life in Ghana]</p>
  </div>
</div>

TEACHER'S LESSON NOTE (for your reference):
---
${teacherNoteHTML}
---

REMEMBER: Return ONLY the HTML above, filled with student-friendly content. No markdown, no code fences, no explanations.
`;

  const { text, provider, model, timestamp } = await generateTextCore({ 
    prompt, 
    task: 'learnerNoteHTML', 
    temperature: 0.45, 
    preferredProvider: details.preferredProvider, 
    providerModelOverride: details.preferredModel 
  });

  return { text, provider, model, task: 'learnerNoteHTML', timestamp };
}

/**
 * Generate Structured Quiz with 4 Question Types in JSON format.
 * Returns: MCQ (multiple choice), True/False, Short Answer, Essay questions.
 */
async function generateStructuredQuizJSON(details = {}) {
  const { 
    topic, 
    subStrandName, 
    className, 
    subjectName, 
    numQuestions = 20,
    preferredProvider, 
    preferredModel 
  } = details;

  const topicText = topic || subStrandName || 'the current topic';

  const prompt = `
You are an expert WAEC examiner creating a comprehensive quiz for ${className} students in ${subjectName}.

Topic: "${topicText}"

Generate a structured quiz with FOUR question types. Return ONLY valid JSON with NO additional text, explanations, or markdown.

REQUIRED JSON STRUCTURE:
{
  "mcq": [
    {
      "question": "string - the question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "string - brief explanation of correct answer"
    }
  ],
  "trueFalse": [
    {
      "statement": "string - a statement that is true or false",
      "answer": true,
      "explanation": "string - why it's true or false"
    }
  ],
  "shortAnswer": [
    {
      "question": "string - question requiring 1-3 sentence answer",
      "expectedAnswer": "string - sample correct answer"
    }
  ],
  "essay": [
    {
      "question": "string - essay question requiring detailed response",
      "markingGuide": "string - key points students should cover"
    }
  ]
}

REQUIREMENTS:
1. **MCQ:** Generate at least ${Math.min(20, numQuestions)} multiple-choice questions with 4 options each
2. **True/False:** Generate 5-10 true/false statements
3. **Short Answer:** Generate 5-10 questions requiring brief answers
4. **Essay:** Generate 3-5 questions requiring detailed explanations

QUALITY STANDARDS:
- All questions must be appropriate for ${className} level
- Questions should cover different aspects of "${topicText}"
- Use clear, simple English suitable for Ghanaian students
- Include local/Ghanaian contexts where relevant
- For MCQ: Make distractors plausible but clearly distinguishable from correct answer
- For True/False: Make statements clear and unambiguous
- For Short Answer: Questions should be answerable in 2-3 sentences
- For Essay: Questions should require analysis, explanation, or application

CRITICAL: Return ONLY the JSON object. No markdown code fences, no explanations, no additional text.
`;

  const { text, provider, model, timestamp } = await generateTextCore({ 
    prompt, 
    task: 'structuredQuiz', 
    temperature: 0.3, 
    jsonNeeded: true, 
    preferredProvider, 
    providerModelOverride: preferredModel 
  });

  const parsed = parseJsonStrict(text);

  // Validate structure
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Quiz must be a valid JSON object.');
  }

  if (!Array.isArray(parsed.mcq)) {
    throw new Error('Quiz must include "mcq" array.');
  }

  if (!Array.isArray(parsed.trueFalse)) {
    throw new Error('Quiz must include "trueFalse" array.');
  }

  if (!Array.isArray(parsed.shortAnswer)) {
    throw new Error('Quiz must include "shortAnswer" array.');
  }

  if (!Array.isArray(parsed.essay)) {
    throw new Error('Quiz must include "essay" array.');
  }

  // Validate MCQ structure
  for (const mcq of parsed.mcq) {
    if (!mcq.question || !Array.isArray(mcq.options) || mcq.options.length !== 4) {
      throw new Error('Each MCQ must have a question and exactly 4 options.');
    }
    if (typeof mcq.correctIndex !== 'number' || mcq.correctIndex < 0 || mcq.correctIndex > 3) {
      throw new Error('Each MCQ must have a valid correctIndex (0-3).');
    }
  }

  // Validate True/False structure
  for (const tf of parsed.trueFalse) {
    if (!tf.statement || typeof tf.answer !== 'boolean') {
      throw new Error('Each True/False must have a statement and boolean answer.');
    }
  }

  // Validate Short Answer structure
  for (const sa of parsed.shortAnswer) {
    if (!sa.question || !sa.expectedAnswer) {
      throw new Error('Each Short Answer must have a question and expectedAnswer.');
    }
  }

  // Validate Essay structure
  for (const essay of parsed.essay) {
    if (!essay.question || !essay.markingGuide) {
      throw new Error('Each Essay must have a question and markingGuide.');
    }
  }

  return { 
    quiz: parsed, 
    provider, 
    model, 
    task: 'structuredQuiz', 
    timestamp 
  };
}

// ✅ EXPORT ALL FUNCTIONS (existing + new)
module.exports = {
  generateTextCore,
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
  generateWaecQuiz,
  getLandingInsights,
  // 🎓 New HTML-based bundle functions
  generateTeacherLessonNoteHTML,
  generateLearnerNoteHTML,
  generateStructuredQuizJSON,
};