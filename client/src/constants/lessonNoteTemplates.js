export const LESSON_NOTE_TEMPLATE_OPTIONS = [
  {
    id: 'modern-academic',
    label: 'Modern Academic',
    description: 'A polished school-ready layout with curriculum cards and structured lesson phases.',
    accent: '#1f4d7a',
    highlights: ['Formal header', 'Balanced tables', 'Clean approval section'],
  },
  {
    id: 'clean-minimal',
    label: 'Clean Minimal',
    description: 'A light, uncluttered design that keeps the focus on the teaching sequence.',
    accent: '#2f5d50',
    highlights: ['Compact summary', 'Minimal borders', 'Fast to scan'],
  },
  {
    id: 'warm-community',
    label: 'Warm Community',
    description: 'A welcoming classroom style with softer tones and grouped teaching blocks.',
    accent: '#a55d2a',
    highlights: ['Warm palette', 'Friendly sections', 'Inviting presentation'],
  },
  {
    id: 'structured-workshop',
    label: 'Structured Workshop',
    description: 'A practical workshop board with action-focused sections and clear checkpoints.',
    accent: '#5b3f8c',
    highlights: ['Action-oriented', 'Workshop grid', 'Assessment callouts'],
  },
];

export const DEFAULT_LESSON_NOTE_TEMPLATE = LESSON_NOTE_TEMPLATE_OPTIONS[0].id;

export const getLessonNoteTemplateOption = (templateId) => {
  return LESSON_NOTE_TEMPLATE_OPTIONS.find((option) => option.id === templateId)
    || LESSON_NOTE_TEMPLATE_OPTIONS[0];
};