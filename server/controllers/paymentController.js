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

const normalizeBulkItemIds = (itemIds = []) => [...new Set(
  (Array.isArray(itemIds) ? itemIds : [itemIds])
    .map((itemId) => String(itemId || '').trim())
    .filter(Boolean)
)].sort();

const resolveBulkDownloadTargets = async ({ itemType, itemIds, teacherId }) => {
  const normalizedItemIds = normalizeBulkItemIds(itemIds);
  const targets = await Promise.all(
    normalizedItemIds.map((itemId) => resolveDownloadTarget({ itemType, itemId, teacherId }))
  );

  const missingItemIds = normalizedItemIds.filter((_, index) => !targets[index]);

  return {
    itemIds: normalizedItemIds,
    missingItemIds,
  };
};

const materializeBulkDownloadPayments = async ({
  userId,
  itemType,
  itemIds,
  format,
  paidAt,
  method,
  amount,
  description,
  groupReference,
}) => {
  const existingChildren = await Payment.find({
    user: userId,
    purpose: 'download',
    bulkGroupReference: groupReference,
    itemType,
    itemId: { $in: itemIds },
    downloadFormat: format,
  }).select('itemId');

  const existingIds = new Set(existingChildren.map((payment) => String(payment.itemId)));
  const paymentsToCreate = itemIds
    .filter((itemId) => !existingIds.has(String(itemId)))
    .map((itemId) => ({
      user: userId,
      amount,
      currency: 'GHS',
      method,
      reference: generateReference('DLI'),
      description,
      status: 'success',
      purpose: 'download',
      itemType,
      itemId,
      downloadFormat: format,
      paidAt,
      bulkGroupReference: groupReference,
    }));

  if (paymentsToCreate.length > 0) {
    await Payment.insertMany(paymentsToCreate);
  }
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
const normalizeDownloadFormat = (format) => {
  const normalized = String(format || 'pdf').trim().toLowerCase();
  return ['pdf', 'html', 'doc', 'txt'].includes(normalized) ? normalized : 'pdf';
};

const hasActiveDownloadExemption = (user) => {
  if (!user?.downloadPaymentExempt) return false;
  if (!user?.downloadPaymentExemptUntil) return true;
  return new Date(user.downloadPaymentExemptUntil).getTime() >= Date.now();
};

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
  const normalizedFormat = normalizeDownloadFormat(format);

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
    description: `Download charge for ${itemType} (${normalizedFormat})`,
    status: 'success',
    purpose: 'download',
    itemType,
    itemId,
    downloadFormat: normalizedFormat,
    paidAt: new Date(),
  });

  res.status(201).json({
    message: 'Download payment successful.',
    charge: {
      amount: DOWNLOAD_FEE_GHS,
      currency: 'GHS',
      itemType,
      itemId,
      format: normalizedFormat,
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
  const normalizedFormat = normalizeDownloadFormat(format);

  if (!itemType || !itemId) {
    res.status(400);
    throw new Error('itemType and itemId are required.');
  }

  if (!['lesson_note', 'learner_note', 'quiz'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid itemType. Must be lesson_note, learner_note, or quiz.');
  }

  const teacher = await User.findById(req.user.id).select(
    '_id email fullName downloadPaymentExempt downloadPaymentExemptReason downloadPaymentExemptUntil'
  );
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher account not found.');
  }

  const target = await resolveDownloadTarget({ itemType, itemId, teacherId: req.user.id });
  if (!target) {
    res.status(404);
    throw new Error('Download target not found or you are not authorized to download it.');
  }

  if (hasActiveDownloadExemption(teacher)) {
    const exemptPayment = await Payment.create({
      user: req.user.id,
      amount: 0,
      currency: 'GHS',
      method: 'admin_exemption',
      reference: generateReference('DLX'),
      description: `Download fee waived by admin for ${itemType} (${normalizedFormat})${teacher.downloadPaymentExemptReason ? ` - ${teacher.downloadPaymentExemptReason}` : ''}`,
      status: 'success',
      purpose: 'download',
      itemType,
      itemId,
      downloadFormat: normalizedFormat,
      paidAt: new Date(),
    });

    return res.status(200).json({
      message: 'Download payment waived by admin.',
      alreadyPaid: true,
      waived: true,
      payment: exemptPayment,
      paystack: null,
    });
  }

  const { secretKey, publicKey } = getPaystackConfig();

  const graceWindowStart = new Date(Date.now() - DOWNLOAD_RETRY_GRACE_MINUTES * 60 * 1000);

  // If a successful payment already exists recently for this exact download item, reuse it.
  const existingSuccessfulPayment = await Payment.findOne({
    user: req.user.id,
    purpose: 'download',
    itemType,
    itemId,
    downloadFormat: normalizedFormat,
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
    downloadFormat: normalizedFormat,
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
        { display_name: 'Format', variable_name: 'format', value: normalizedFormat },
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
    description: `Download charge for ${itemType} (${normalizedFormat})`,
    status: 'pending',
    purpose: 'download',
    itemType,
    itemId,
    downloadFormat: normalizedFormat,
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
 * @desc   Initialize Paystack payment for multiple downloadable assets
 * @route  POST /api/payments/downloads/bulk/initialize
 * @access Private (Teacher)
 */
const initializeBulkDownloadPayment = asyncHandler(async (req, res) => {
  const { itemType, itemIds, format } = req.body;
  const normalizedFormat = normalizeDownloadFormat(format);

  if (!itemType || !Array.isArray(itemIds) || itemIds.length === 0) {
    res.status(400);
    throw new Error('itemType and itemIds are required.');
  }

  if (!['lesson_note', 'learner_note', 'quiz'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid itemType. Must be lesson_note, learner_note, or quiz.');
  }

  const teacher = await User.findById(req.user.id).select(
    '_id email fullName downloadPaymentExempt downloadPaymentExemptReason downloadPaymentExemptUntil'
  );
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher account not found.');
  }

  const { itemIds: normalizedItemIds, missingItemIds } = await resolveBulkDownloadTargets({
    itemType,
    itemIds,
    teacherId: req.user.id,
  });

  if (normalizedItemIds.length === 0) {
    res.status(400);
    throw new Error('At least one valid itemId is required.');
  }

  if (missingItemIds.length > 0) {
    res.status(404);
    throw new Error('One or more download targets were not found or are not authorized.');
  }

  if (hasActiveDownloadExemption(teacher)) {
    const groupReference = generateReference('DLXG');
    const paidAt = new Date();
    await materializeBulkDownloadPayments({
      userId: req.user.id,
      itemType,
      itemIds: normalizedItemIds,
      format: normalizedFormat,
      paidAt,
      method: 'admin_exemption',
      amount: 0,
      description: `Bulk download fee waived by admin for ${itemType} (${normalizedFormat})${teacher.downloadPaymentExemptReason ? ` - ${teacher.downloadPaymentExemptReason}` : ''}`,
      groupReference,
    });

    return res.status(200).json({
      message: 'Bulk download payment waived by admin.',
      alreadyPaid: true,
      waived: true,
      charge: {
        amount: 0,
        currency: 'GHS',
        itemType,
        itemCount: normalizedItemIds.length,
        itemIds: normalizedItemIds,
        format: normalizedFormat,
      },
      paystack: null,
    });
  }

  const { secretKey, publicKey } = getPaystackConfig();
  const graceWindowStart = new Date(Date.now() - DOWNLOAD_RETRY_GRACE_MINUTES * 60 * 1000);

  const successfulPayments = await Payment.find({
    user: req.user.id,
    purpose: 'download',
    itemType,
    itemId: { $in: normalizedItemIds },
    downloadFormat: normalizedFormat,
    status: 'success',
    createdAt: { $gte: graceWindowStart },
  }).select('itemId');

  const successfulIds = new Set(successfulPayments.map((payment) => String(payment.itemId)));
  const unpaidItemIds = normalizedItemIds.filter((itemId) => !successfulIds.has(String(itemId)));

  if (unpaidItemIds.length === 0) {
    return res.status(200).json({
      message: 'Existing successful payments found for these downloads.',
      alreadyPaid: true,
      charge: {
        amount: 0,
        currency: 'GHS',
        itemType,
        itemCount: normalizedItemIds.length,
        itemIds: normalizedItemIds,
        format: normalizedFormat,
      },
      paystack: null,
    });
  }

  const existingPendingPayment = await Payment.findOne({
    user: req.user.id,
    purpose: 'download',
    itemType,
    downloadFormat: normalizedFormat,
    status: 'pending',
    bulkCount: unpaidItemIds.length,
    bulkItemIds: unpaidItemIds,
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

        await materializeBulkDownloadPayments({
          userId: req.user.id,
          itemType,
          itemIds: unpaidItemIds,
          format: normalizedFormat,
          paidAt: existingPendingPayment.paidAt,
          method: 'paystack',
          amount: DOWNLOAD_FEE_GHS,
          description: `Bulk download charge for ${itemType} (${normalizedFormat})`,
          groupReference: existingPendingPayment.reference,
        });

        return res.status(200).json({
          message: 'Recovered successful bulk payment for these downloads.',
          alreadyPaid: true,
          charge: {
            amount: 0,
            currency: 'GHS',
            itemType,
            itemCount: normalizedItemIds.length,
            itemIds: normalizedItemIds,
            format: normalizedFormat,
          },
          paystack: null,
        });
      }
    } catch (error) {
      console.warn('Pending bulk payment verification during initialize failed:', error.message);
    }
  }

  const reference = generateReference('DLB');
  const totalAmount = unpaidItemIds.length * DOWNLOAD_FEE_GHS;
  const paystackPayload = {
    email: teacher.email,
    amount: amountToKobo(totalAmount),
    currency: 'GHS',
    reference,
    metadata: {
      custom_fields: [
        { display_name: 'Purpose', variable_name: 'purpose', value: 'bulk_download' },
        { display_name: 'Item Type', variable_name: 'item_type', value: itemType },
        { display_name: 'Item Count', variable_name: 'item_count', value: String(unpaidItemIds.length) },
        { display_name: 'Format', variable_name: 'format', value: normalizedFormat },
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
    throw new Error('Unable to initialize bulk payment with Paystack.');
  }

  const payment = await Payment.create({
    user: req.user.id,
    amount: totalAmount,
    currency: 'GHS',
    method: 'paystack',
    reference,
    description: `Bulk download charge for ${itemType} x${unpaidItemIds.length} (${normalizedFormat})`,
    status: 'pending',
    purpose: 'download',
    itemType,
    bulkItemIds: unpaidItemIds,
    bulkCount: unpaidItemIds.length,
    downloadFormat: normalizedFormat,
  });

  res.status(201).json({
    message: 'Bulk download payment initialized.',
    alreadyPaid: false,
    payment,
    charge: {
      amount: totalAmount,
      currency: 'GHS',
      itemType,
      itemCount: unpaidItemIds.length,
      itemIds: unpaidItemIds,
      format: normalizedFormat,
    },
    paystack: {
      publicKey,
      reference,
      amount: totalAmount,
      currency: 'GHS',
      accessCode: paystackResponse.data.data.access_code,
      authorizationUrl: paystackResponse.data.data.authorization_url,
      email: teacher.email,
      displayName: teacher.fullName,
    },
  });
});

/**
 * @desc   Verify Paystack payment for multiple downloadable assets
 * @route  POST /api/payments/downloads/bulk/verify
 * @access Private (Teacher)
 */
const verifyBulkDownloadPayment = asyncHandler(async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    res.status(400);
    throw new Error('reference is required.');
  }

  const payment = await Payment.findOne({
    user: req.user.id,
    reference,
    purpose: 'download',
    bulkCount: { $gt: 0 },
  });

  if (!payment) {
    res.status(404);
    throw new Error('Bulk payment reference not found.');
  }

  if (payment.status === 'success') {
    return res.json({
      message: 'Bulk payment already verified.',
      payment,
      charge: {
        amount: payment.amount,
        currency: payment.currency || 'GHS',
        itemType: payment.itemType,
        itemCount: payment.bulkCount,
        itemIds: payment.bulkItemIds || [],
        format: payment.downloadFormat,
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
    throw new Error('Bulk payment verification failed.');
  }

  payment.status = 'success';
  payment.paidAt = tx?.paid_at ? new Date(tx.paid_at) : new Date();
  payment.method = 'paystack';
  await payment.save();

  await materializeBulkDownloadPayments({
    userId: req.user.id,
    itemType: payment.itemType,
    itemIds: (payment.bulkItemIds || []).map((itemId) => String(itemId)),
    format: payment.downloadFormat,
    paidAt: payment.paidAt,
    method: 'paystack',
    amount: DOWNLOAD_FEE_GHS,
    description: `Bulk download charge for ${payment.itemType} (${payment.downloadFormat})`,
    groupReference: payment.reference,
  });

  res.json({
    message: 'Bulk payment verified successfully.',
    payment,
    charge: {
      amount: payment.amount,
      currency: payment.currency || 'GHS',
      itemType: payment.itemType,
      itemCount: payment.bulkCount,
      itemIds: payment.bulkItemIds || [],
      format: payment.downloadFormat,
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
  initializeBulkDownloadPayment,
  verifyDownloadPayment,
  verifyBulkDownloadPayment,
  getAllPayments,
  getUserPayments,
  getPaymentSummary,
  deletePayment,
};
