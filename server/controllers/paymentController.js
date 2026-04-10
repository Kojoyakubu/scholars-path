// /server/controllers/paymentController.js

const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const aiService = require('../services/aiService');
const mongoose = require('mongoose');

const DOWNLOAD_FEE_GHS = 0.5;

const generateReference = (prefix = 'PAY') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

const resolveDownloadTarget = async ({ itemType, itemId, teacherId }) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) return null;

  const normalizedTeacherId = String(teacherId);

  if (itemType === 'lesson_note') {
    const lessonNote = await LessonNote.findById(itemId).select('_id teacher');
    return lessonNote && String(lessonNote.teacher) === normalizedTeacherId ? lessonNote : null;
  }

  if (itemType === 'learner_note') {
    const learnerNote = await LearnerNote.findById(itemId).select('_id author');
    return learnerNote && String(learnerNote.author) === normalizedTeacherId ? learnerNote : null;
  }

  if (itemType === 'quiz') {
    const quiz = await Quiz.findById(itemId).select('_id teacher');
    return quiz && String(quiz.teacher) === normalizedTeacherId ? quiz : null;
  }

  return null;
};

/**
 * @desc   Create a new payment record
 * @route  POST /api/payments
 * @access Private (Admin/System)
 */
const createPayment = asyncHandler(async (req, res) => {
  const { userId, amount, method, reference, description, purpose, itemType, itemId } = req.body;

  if (!userId || !amount || !method || !reference) {
    res.status(400);
    throw new Error('Missing required payment fields.');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  const payment = await Payment.create({
    user: userId,
    amount,
    currency: 'GHS',
    method,
    reference,
    description,
    status: 'success',
    purpose: purpose || 'other',
    itemType,
    itemId,
    paidAt: new Date(),
  });

  res.status(201).json({
    message: 'Payment recorded successfully.',
    payment,
  });
});

/**
 * @desc   Get current download pricing for teachers
 * @route  GET /api/payments/download-pricing
 * @access Private (Teacher/Admin)
 */
const getDownloadPricing = asyncHandler(async (req, res) => {
  res.json({
    currency: 'GHS',
    amountPerDownload: DOWNLOAD_FEE_GHS,
    supportedItemTypes: ['lesson_note', 'learner_note', 'quiz'],
  });
});

/**
 * @desc   Charge teacher for a single downloadable generated asset
 * @route  POST /api/payments/downloads/charge
 * @access Private (Teacher)
 */
const chargeDownload = asyncHandler(async (req, res) => {
  const { itemType, itemId, format, method } = req.body;

  if (!itemType || !itemId) {
    res.status(400);
    throw new Error('itemType and itemId are required.');
  }

  if (!['lesson_note', 'learner_note', 'quiz'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid itemType. Must be lesson_note, learner_note, or quiz.');
  }

  const target = await resolveDownloadTarget({ itemType, itemId, teacherId: req.user.id });
  if (!target) {
    res.status(404);
    throw new Error('Download target not found or you are not authorized to download it.');
  }

  const payment = await Payment.create({
    user: req.user.id,
    amount: DOWNLOAD_FEE_GHS,
    currency: 'GHS',
    method: method || 'mobile_money',
    reference: generateReference('DL'),
    description: `Download charge for ${itemType}${format ? ` (${format})` : ''}`,
    status: 'success',
    purpose: 'download',
    itemType,
    itemId,
    paidAt: new Date(),
  });

  res.status(201).json({
    message: 'Download payment successful.',
    charge: {
      amount: DOWNLOAD_FEE_GHS,
      currency: 'GHS',
      itemType,
      itemId,
      format: format || 'unknown',
    },
    payment,
  });
});

/**
 * @desc   Get all payments (admin)
 * @route  GET /api/payments
 * @access Private (Admin)
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  res.json(payments);
});

/**
 * @desc   Get payments for a specific user
 * @route  GET /api/payments/user/:id
 * @access Private
 */
const getUserPayments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid user ID.');
  }

  const payments = await Payment.find({ user: id }).sort({ createdAt: -1 });
  res.json(payments);
});

/**
 * @desc   Generate AI invoice/payment summary
 * @route  GET /api/payments/:id/summary
 * @access Private (Admin/Teacher)
 */
const getPaymentSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid payment ID.');
  }

  const payment = await Payment.findById(id).populate('user', 'name email role');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found.');
  }

  const prompt = `
You are a financial assistant for an educational institution.
Generate a short invoice explanation for this payment record:

Payment Details:
- Name: ${payment.user?.name || 'N/A'}
- Role: ${payment.user?.role || 'N/A'}
- Amount: GHS ${payment.amount}
- Method: ${payment.method}
- Reference: ${payment.reference}
- Description: ${payment.description || 'No description'}
- Date: ${payment.createdAt.toDateString()}
- Status: ${payment.status}

Instructions:
1. Write in clear, simple English (max 4 sentences).
2. State what the payment likely represents (e.g., subscription, renewal, or purchase).
3. Mention if it was successful and which method was used.
4. Be formal and concise.
`;

  try {
    const { text, provider, model } = await aiService.generateTextCore({
      prompt,
      task: 'paymentSummary',
      temperature: 0.4,
      preferredProvider: 'chatgpt', // ChatGPT or Gemini works best for structured summaries
    });

    res.json({
      payment,
      aiSummary: text.trim(),
      provider,
      model,
    });
  } catch (err) {
    console.error('AI payment summary failed:', err.message);
    res.json({
      payment,
      aiSummary: `Payment of GHS ${payment.amount} was recorded successfully for ${payment.user?.name}.`,
      provider: 'fallback',
    });
  }
});

/**
 * @desc   Delete a payment (admin only)
 * @route  DELETE /api/payments/:id
 * @access Private (Admin)
 */
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found.');
  }

  await payment.deleteOne();
  res.json({ message: 'Payment deleted successfully.' });
});

module.exports = {
  createPayment,
  getDownloadPricing,
  chargeDownload,
  getAllPayments,
  getUserPayments,
  getPaymentSummary,
  deletePayment,
};
