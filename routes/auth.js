const express = require('express');
const router = express.Router();
const User = require('../models/User');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/send-verification', async (req, res) => {
  const { phoneNumber } = req.body;
  const verificationId = uuidv4();
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { phoneNumber, verificationId, isVerified: false },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ response: error, message: 'User Not Found' });
    }

    await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    res.json({ response: success, message: 'Verification code sent', verificationId });
  } catch (error) {
    res.status(500).json({ response: error, message: error.message });
  }
});

router.post('/verify-code', async (req, res) => {
  const { verificationId, code } = req.body;

  try {
    const user = await User.findOne({ verificationId });
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: 'Verified successfully', userId: user.userId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
