const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Subscription = require('../models/subscriptionModel');

// @desc    Initialize a payment with Paystack
// @route   POST /api/payments/initialize
// @access  Private
const initializePayment = asyncHandler(async (req, res) => {
  const { email, amount, plan } = req.body;
  const response = await axios.post('https://api.paystack.co/transaction/initialize', {
    email,
    amount,
    metadata: {
      userId: req.user._id,
      plan: plan,
    }
  }, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    }
  });
  res.json(response.data);
});

// @desc    Verify a Paystack payment
// @route   GET /api/payments/verify/:reference
// @access  Public (Webhook/Callback from Paystack)
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    }
  });

  const { status, data } = response.data;

  if (status === true && data.status === 'success') {
    const { userId, plan } = data.metadata;
    const expiresAt = new Date();
    const subscriptionDays = plan === 'yearly' ? 365 : 30;
    expiresAt.setDate(expiresAt.getDate() + subscriptionDays);

    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        plan: plan,
        status: 'active',
        paystackReference: reference,
        expiresAt: expiresAt,
      },
      { upsert: true, new: true }
    );
    res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
});

module.exports = {
  initializePayment,
  verifyPayment,
};