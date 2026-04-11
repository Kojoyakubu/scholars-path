// /server/controllers/paymentController.js

const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const aiService = require('../services/aiService');
const mongoose = require('mongoose');

const DOWNLOAD_FEE_GHS = 0.5;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const DOWNLOAD_RETRY_GRACE_MINUTES = 60;

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

const getPaystackConfig = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

  if (!secretKey || !publicKey) {
    const err = new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY.');
    err.statusCode = 500;
    throw err;
  }

  return { secretKey, publicKey };
};

const amountToKobo = (amount) => Math.round(Number(amount) * 100);

const verifyPaystackReference = async ({ secretKey, reference }) => {
  const verifyResponse = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      timeout: 15000,
    }
  );

  return verifyResponse.data?.data;
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
 * @desc   Initialize Paystack payment for a downloadable asset
 * @route  POST /api/payments/downloads/initialize
 * @access Private (Teacher)
 */
const initializeDownloadPayment = asyncHandler(async (req, res) => {
  const { itemType, itemId, format } = req.body;

  if (!itemType || !itemId) {
    res.status(400);
    throw new Error('itemType and itemId are required.');
  }

  if (!['lesson_note', 'learner_note', 'quiz'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid itemType. Must be lesson_note, learner_note, or quiz.');
  }

  const teacher = await User.findById(req.user.id).select('_id email fullName');
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher account not found.');
  }

  const target = await resolveDownloadTarget({ itemType, itemId, teacherId: req.user.id });
  if (!target) {
    res.status(404);
    throw new Error('Download target not found or you are not authorized to download it.');
  }

  const { secretKey, publicKey } = getPaystackConfig();

  const graceWindowStart = new Date(Date.now() - DOWNLOAD_RETRY_GRACE_MINUTES * 60 * 1000);

  // If a successful payment already exists recently for this exact download item, reuse it.
  const existingSuccessfulPayment = await Payment.findOne({
    user: req.user.id,
    purpose: 'download',
    itemType,
    itemId,
    status: 'success',
    createdAt: { $gte: graceWindowStart },
  }).sort({ createdAt: -1 });

  if (existingSuccessfulPayment) {
    return res.status(200).json({
      message: 'Existing successful payment found for this download.',
      alreadyPaid: true,
      payment: existingSuccessfulPayment,
      paystack: null,
    });
  }

  // If there is a pending payment for this item, verify it before creating a new charge.
  const existingPendingPayment = await Payment.findOne({
    user: req.user.id,
    purpose: 'download',
    itemType,
    itemId,
    status: 'pending',
    createdAt: { $gte: graceWindowStart },
  }).sort({ createdAt: -1 });

  if (existingPendingPayment) {
    try {
      const tx = await verifyPaystackReference({
        secretKey,
        reference: existingPendingPayment.reference,
      });

      const isValidSuccess = Boolean(
        tx?.status === 'success' &&
        Number(tx?.amount) === amountToKobo(existingPendingPayment.amount) &&
        String(tx?.currency || '').toUpperCase() === 'GHS'
      );

      if (isValidSuccess) {
        existingPendingPayment.status = 'success';
        existingPendingPayment.paidAt = tx?.paid_at ? new Date(tx.paid_at) : new Date();
        existingPendingPayment.method = 'paystack';
        await existingPendingPayment.save();

        return res.status(200).json({
          message: 'Recovered successful payment for this download.',
          alreadyPaid: true,
          payment: existingPendingPayment,
          paystack: null,
        });
      }
    } catch (error) {
      // If Paystack verify fails transiently, continue with a fresh initialize.
      console.warn('Pending payment verification during initialize failed:', error.message);
    }
  }

  const reference = generateReference('DL');

  const paystackPayload = {
    email: teacher.email,
    amount: amountToKobo(DOWNLOAD_FEE_GHS),
    currency: 'GHS',
    reference,
    metadata: {
      custom_fields: [
        { display_name: 'Purpose', variable_name: 'purpose', value: 'download' },
        { display_name: 'Item Type', variable_name: 'item_type', value: itemType },
        { display_name: 'Item ID', variable_name: 'item_id', value: String(itemId) },
        { display_name: 'Format', variable_name: 'format', value: format || 'pdf' },
      ],
    },
  };

  const paystackResponse = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    paystackPayload,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  if (!paystackResponse.data?.status || !paystackResponse.data?.data?.reference) {
    res.status(502);
    throw new Error('Unable to initialize payment with Paystack.');
  }

  const payment = await Payment.create({
    user: req.user.id,
    amount: DOWNLOAD_FEE_GHS,
    currency: 'GHS',
    method: 'paystack',
    reference,
    description: `Download charge for ${itemType}${format ? ` (${format})` : ''}`,
    status: 'pending',
    purpose: 'download',
    itemType,
    itemId,
  });

  res.status(201).json({
    message: 'Download payment initialized.',
    alreadyPaid: false,
    payment,
    paystack: {
      publicKey,
      reference,
      amount: DOWNLOAD_FEE_GHS,
      currency: 'GHS',
      accessCode: paystackResponse.data.data.access_code,
      authorizationUrl: paystackResponse.data.data.authorization_url,
      email: teacher.email,
      displayName: teacher.fullName,
    },
  });
});

/**
 * @desc   Verify Paystack payment for a downloadable asset
 * @route  POST /api/payments/downloads/verify
 * @access Private (Teacher)
 */
const verifyDownloadPayment = asyncHandler(async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    res.status(400);
    throw new Error('reference is required.');
  }

  const payment = await Payment.findOne({
    user: req.user.id,
    reference,
    purpose: 'download',
  });

  if (!payment) {
    res.status(404);
    throw new Error('Payment reference not found.');
  }

  if (payment.status === 'success') {
    return res.json({
      message: 'Payment already verified.',
      payment,
      charge: {
        amount: payment.amount,
        currency: payment.currency || 'GHS',
        itemType: payment.itemType,
        itemId: payment.itemId,
      },
    });
  }

  const { secretKey } = getPaystackConfig();
  const tx = await verifyPaystackReference({ secretKey, reference });
  const isValidSuccess = Boolean(
    tx?.status === 'success' &&
    Number(tx?.amount) === amountToKobo(payment.amount) &&
    String(tx?.currency || '').toUpperCase() === 'GHS'
  );

  if (!isValidSuccess) {
    payment.status = 'failed';
    await payment.save();

    res.status(400);
    throw new Error('Payment verification failed.');
  }

  payment.status = 'success';
  payment.paidAt = tx?.paid_at ? new Date(tx.paid_at) : new Date();
  payment.method = 'paystack';
  await payment.save();

  res.json({
    message: 'Payment verified successfully.',
    payment,
    charge: {
      amount: payment.amount,
      currency: payment.currency || 'GHS',
      itemType: payment.itemType,
      itemId: payment.itemId,
    },
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
  initializeDownloadPayment,
  verifyDownloadPayment,
  getAllPayments,
  getUserPayments,
  getPaymentSummary,
  deletePayment,
};
