// server/controllers/paymentController.js

const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto'); // Needed for webhook verification
const Subscription = require('../models/subscriptionModel');

// --- Service function (Ideally, move this to a separate file e.g., /services/subscriptionService.js) ---

/**
 * Creates or updates a user's subscription record.
 * @param {string} userId - The user's ID.
 * @param {string} plan - The subscription plan ('monthly' or 'yearly').
 * @param {string} reference - The Paystack transaction reference.
 * @returns {Promise<object>} The created or updated subscription document.
 */
const activateSubscription = async (userId, plan, reference) => {
  const expiresAt = new Date();
  const subscriptionDays = plan === 'yearly' ? 365 : 30;
  expiresAt.setDate(expiresAt.getDate() + subscriptionDays);

  return Subscription.findOneAndUpdate(
    { user: userId },
    {
      plan,
      status: 'active',
      paystackReference: reference,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true } // `setDefaultsOnInsert` is good practice
  );
};

// --- Controller Functions ---

// @desc    Initialize a payment with Paystack
// @route   POST /api/payments/initialize
// @access  Private
const initializePayment = asyncHandler(async (req, res) => {
  const { amount, plan } = req.body; // Email is taken from the authenticated user
  const email = req.user.email;

  // Validate required environment variables
  if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key is not configured.');
  }

  // Input validation
  if (!amount || !plan || !['monthly', 'yearly'].includes(plan)) {
      res.status(400);
      throw new Error('Invalid request. Amount and a valid plan (monthly/yearly) are required.');
  }

  const response = await axios.post('https://api.paystack.co/transaction/initialize', {
    email,
    amount: amount * 100, // Paystack expects amount in kobo
    metadata: {
      userId: req.user._id.toString(), // Ensure it's a string
      plan,
    }
  }, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  res.json(response.data);
});


// @desc    Handle Paystack webhook for payment verification
// @route   POST /api/payments/webhook
// @access  Public (Webhook from Paystack)
const handlePaystackWebhook = asyncHandler(async (req, res) => {
    // --- SECURITY: Verify the webhook signature ---
    // This ensures the request is genuinely from Paystack.
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                       .update(JSON.stringify(req.body))
                       .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        // Signature is invalid, ignore the request
        return res.sendStatus(401);
    }

    const event = req.body;

    // Process only successful charge events
    if (event.event === 'charge.success') {
        const { status, reference, metadata } = event.data;
        
        if (status === 'success') {
            const { userId, plan } = metadata;
            
            // Check if userId and plan exist in metadata
            if (userId && plan) {
                await activateSubscription(userId, plan, reference);
                console.log(`Subscription activated for user: ${userId}`);
            } else {
                console.error('Webhook received with missing userId or plan in metadata.', metadata);
            }
        }
    }

    // Acknowledge receipt of the event to Paystack
    res.sendStatus(200);
});


module.exports = {
  initializePayment,
  handlePaystackWebhook, // Changed from verifyPayment to reflect webhook pattern
};