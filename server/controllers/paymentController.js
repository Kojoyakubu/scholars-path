const axios = require('axios');
const Subscription = require('../models/subscriptionModel');

const initializePayment = async (req, res) => {
  const { email, amount, plan } = req.body;
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
    console.error('Paystack Initialization Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

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
      
      const expiresAt = new Date();
      // Example: make this dynamic based on plan
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
  } catch (error) {
    console.error('Paystack Verification Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = { initializePayment, verifyPayment };