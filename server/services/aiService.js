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
const OPENAI_MAIN = process.env.OPENAI_MODEL_MAIN || 'gpt-4o';         // fallback model name
const OPENAI_JSON = process.env.OPENAI_MODEL_JSON || 'gpt-4o-mini';    // cheaper for JSON tasks
const CLAUDE_MAIN = process.env.CLAUDE_MODEL_MAIN || 'claude-3-5-sonnet-20241022';

// ---- Utilities ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Remove surrounding code fences and stray commentary from a model's JSON output.
 */
function extractJson(text) {
  if (!text) return '';
  let cleaned = text.trim();

  // Strip code fences ```json ... ```
  cleaned = cleaned.replace(/^```json\s*([\s\S]*?)\s*```$/i, '$1').trim();
  cleaned = cleaned.replace(/^```\s*([\s\S]*?)\s*```$/i, '$1').trim();

  // Try to locate the first JSON array/object if extra text exists
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const startIdx = [firstBrace, firstBracket].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (startIdx > 0) cleaned = cleaned.slice(startIdx);

  // Heuristic: cut off trailing junk after the last matching brace/bracket
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);
  if (endIdx > 0 && endIdx < cleaned.length - 1) cleaned = cleaned.slice(0, endIdx + 1);

  return cleaned.trim();
}

/**
 * Parse JSON safely with a clear error.
 */
function parseJsonStrict(text) {
  const cleaned = extractJson(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const preview = cleaned.slice(0, 400);
    throw new Error(`Invalid JSON from AI. Preview:\n${preview}`);
  }
}

/**
 * Auto-select provider if not specified, based on task type.
 * - "quiz" or explicit jsonNeeded => prefer fast/JSON-friendly models
 * - "lesson" / "learnerNote" => prefer richer reasoning (Gemini/OpenAI main)
 */
function pickProvider({ task = 'generic', jsonNeeded = false, preferredProvider }) {
  if (preferredProvider) return preferredProvider.toLowerCase();

  // If JSON is strictly required, try OpenAI first (very reliable JSON modes),
  // else use Gemini fast for speed if available.
  if (jsonNeeded || /quiz/i.test(task)) {
    if (hasOpenAI) return 'openai';
    if (hasGemini) return 'gemini';
    if (hasClaude) return 'claude';
  }

  // For rich educational prose or structured pedagogy:
  if (/lesson|learner|note|explain/i.test(task)) {
    if (hasGemini) return 'gemini';
    if (hasOpenAI) return 'openai';
    if (hasClaude) return 'claude';
  }

  // Fallback preference
  if (hasOpenAI) return 'openai';
  if (hasGemini) return 'gemini';
  if (hasClaude) return 'claude';

  throw new Error('No AI providers available.');
}

/**
 * Core text generation wrapper with retries.
 */
async function generateTextCore({
  prompt,
  task = 'generic',
  temperature = 0.4,
  jsonNeeded = false,
  preferredProvider,
  // Advanced knobs if you want to override per-call:
  providerModelOverride,
}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string.');
  }

  const provider = pickProvider({ task, jsonNeeded, preferredProvider });
  let modelUsed = '';
  let text = '';
  let raw = null;

  // Simple retry mechanism for transient errors
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      if (provider === 'gemini') {
        if (!gemini) throw new Error('Gemini not configured.');
        const modelName =
          providerModelOverride ||
          (jsonNeeded || /quiz/i.test(task) ? GEMINI_FAST : GEMINI_MAIN);

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
        const modelName =
          providerModelOverride ||
          (jsonNeeded || /quiz/i.test(task) ? OPENAI_JSON : OPENAI_MAIN);

        // Use chat.completions for broad compatibility
        const resp = await openai.chat.completions.create({
          model: modelName,
          temperature,
          messages: [{ role: 'user', content: prompt }],
          // If you want stricter JSON, you can also pass tools or response_format (for supported models)
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

        // Claude returns an array of content blocks; join text blocks
        const parts = Array.isArray(resp?.content)
          ? resp.content.map((c) => c?.text || '').filter(Boolean)
          : [];
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
      // Backoff and retry
      await sleep(250 * (attempt + 1));
    }
  }

  // Should never get here
  throw new Error('AI generation failed after retries.');
}

// ========================
// High-level task helpers
// ========================

/**
 * Generate a Ghanaian teacher lesson note (Markdown).
 */
async function generateGhanaianLessonNote(details = {}) {
  const {
    school, className, subjectName, strandName, subStrandName, week,
    term, duration, classSize, reference, contentStandardCode,
    indicatorCodes, dayDate,
    preferredModel, preferredProvider,
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
`;

  const { text, provider, model, timestamp } = await generateTextCore({
    prompt,
    task: 'lessonNote',
    temperature: 0.4,
    preferredProvider,
    providerModelOverride: preferredModel,
  });

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

  const { text, provider, model, timestamp } = await generateTextCore({
    prompt,
    task: 'learnerNote',
    temperature: 0.45,
    preferredProvider: opts.preferredProvider,
    providerModelOverride: opts.preferredModel,
  });

  return { text, provider, model, task: 'learnerNote', timestamp };
}

/**
 * Generate WAEC-style multiple-choice quiz questions in strict JSON.
 * Returns a parsed JSON array.
 */
async function generateWaecQuiz(details = {}) {
  const {
    topic,
    className,
    subjectName,
    numQuestions = 5,
    preferredProvider,
    preferredModel,
  } = details;

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

  const { text, provider, model, timestamp } = await generateTextCore({
    prompt,
    task: 'quiz',
    temperature: 0.2,
    jsonNeeded: true,
    preferredProvider,
    providerModelOverride: preferredModel,
  });

  // Validate & parse JSON
  const parsed = parseJsonStrict(text);

  // Light schema sanity checks
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

  return {
    quiz: parsed,
    provider,
    model,
    task: 'quiz',
    timestamp,
  };
}

module.exports = {
  generateTextCore,              // generic access if you need it elsewhere
  generateGhanaianLessonNote,
  generateLearnerFriendlyNote,
  generateWaecQuiz,
};
