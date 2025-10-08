const axios = require('axios');
const Subscription = require('../models/subscriptionModel');

// @desc    Initialize a payment transaction
// @route   POST /api/payments/initialize
const initializePayment = async (req, res) => {
  const { email, amount, plan } = req.body; // Amount should be in the smallest currency unit (e.g., pesewas)

  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

// @desc    Verify a payment transaction
// @route   GET /api/payments/verify/:reference
const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { status, data } = response.data;

    if (status === true && data.status === 'success') {
      const { userId, plan } = data.metadata;
      
      // Payment is successful, create or update the user's subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Example: 30-day subscription

      await Subscription.findOneAndUpdate(
        { user: userId },
        {
          user: userId,
          plan: plan,
          status: 'active',
          paystackReference: reference,
          expiresAt: expiresAt,
        },
        { upsert: true, new: true } // Create if it doesn't exist, update if it does
      );

      // Redirect user to a success page on the frontend
      res.redirect('http://localhost:5173/payment-success');
    } else {
      res.redirect('http://localhost:5173/payment-failed');
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = { initializePayment, verifyPayment };