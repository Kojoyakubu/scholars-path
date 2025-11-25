const mongoose = require('mongoose');

/**
 * LessonBundle Model
 * Represents a complete lesson package containing:
 * - Teacher Lesson Note
 * - Learner Note
 * - Quiz (with all question types)
 * - Resources (optional)
 * 
 * Features:
 * - Reusable across different classes/terms
 * - Editable metadata
 * - Cascade delete protection
 * - Published/Draft status
 */
const lessonBundleSchema = new mongoose.Schema(
  {
    // Ownership & Organization
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    
    // Curriculum Context
    subStrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubStrand',
      required: true,
      index: true,
    },
    
    // Bundle Metadata
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    
    // Status Management
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    
    // Bundle Components (References)
    lessonNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonNote',
      required: true,
    },
    learnerNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearnerNote',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    resources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
    }],
    
    // Original Generation Context (for reference)
    generationContext: {
      school: String,
      term: String,
      week: String,
      dayDate: String,
      duration: String,
      classSize: Number,
      contentStandardCode: String,
      indicatorCodes: String,
      reference: String,
      className: String,
      subjectName: String,
      strandName: String,
    },
    
    // AI Generation Info
    aiProvider: String,
    aiModel: String,
    aiGeneratedAt: Date,
    
    // Usage Statistics
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,
    
    // Tags for search/filter
    tags: [String],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
lessonBundleSchema.index({ teacher: 1, status: 1, createdAt: -1 });
lessonBundleSchema.index({ school: 1, subStrand: 1 });
lessonBundleSchema.index({ title: 'text', description: 'text' });

// Virtual for checking if bundle is editable
lessonBundleSchema.virtual('isEditable').get(function() {
  return this.status === 'draft' || this.status === 'published';
});

// Pre-remove middleware: Handle cascade deletion
lessonBundleSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const LessonNote = mongoose.model('LessonNote');
    const LearnerNote = mongoose.model('LearnerNote');
    const Quiz = mongoose.model('Quiz');
    const Question = mongoose.model('Question');
    const Option = mongoose.model('Option');
    const Resource = mongoose.model('Resource');
    
    console.log(`🗑️ Deleting Bundle: ${this._id}`);
    
    // Delete associated quiz questions and options
    if (this.quiz) {
      const questions = await Question.find({ quiz: this.quiz });
      const questionIds = questions.map(q => q._id);
      
      // Delete all options for these questions
      await Option.deleteMany({ question: { $in: questionIds } });
      console.log(`   ✓ Deleted options for ${questions.length} questions`);
      
      // Delete all questions
      await Question.deleteMany({ quiz: this.quiz });
      console.log(`   ✓ Deleted ${questions.length} questions`);
      
      // Delete the quiz
      await Quiz.findByIdAndDelete(this.quiz);
      console.log(`   ✓ Deleted quiz: ${this.quiz}`);
    }
    
    // Delete lesson note
    if (this.lessonNote) {
      await LessonNote.findByIdAndDelete(this.lessonNote);
      console.log(`   ✓ Deleted lesson note: ${this.lessonNote}`);
    }
    
    // Delete learner note
    if (this.learnerNote) {
      await LearnerNote.findByIdAndDelete(this.learnerNote);
      console.log(`   ✓ Deleted learner note: ${this.learnerNote}`);
    }
    
    // Optionally delete resources (if not shared)
    // Note: Resources might be shared across bundles, so be careful
    // For now, we'll keep resources but you can uncomment to delete
    // if (this.resources && this.resources.length > 0) {
    //   await Resource.deleteMany({ _id: { $in: this.resources } });
    //   console.log(`   ✓ Deleted ${this.resources.length} resources`);
    // }
    
    console.log(`✅ Bundle ${this._id} and all components deleted`);
    next();
  } catch (error) {
    console.error('Error in bundle pre-delete middleware:', error);
    next(error);
  }
});

module.exports = mongoose.model('LessonBundle', lessonBundleSchema);