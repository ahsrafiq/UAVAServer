const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
require('dotenv').config();
//const twilio = require('twilio');

router.post('/send-verification', async (req, res) => {
  //const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const { phoneNumber } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  // await client.messages.create({
  //   body: `Your verification code is: ${verificationCode}`,
  //   to: phoneNumber,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  // });

  //   res.json({ response: success, message: 'Verification code sent', verificationId });
  // } catch (error) {
  //   res.status(500).json({ response: error, message: error.message });
  // }

  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone: phoneNumber,
      message: `Your verification code is: ${verificationCode}`,
      key: process.env.TEXTBELT_API_KEY,
    });

    if (response.data.success) {
      await User.updateOne(
        { phoneNumber },
        { verificationCode },
        { upsert: true }
      );

      res.json({ success: true, message: 'Verification code sent' });
    } else {
      res.json({
        success: false,
        message: response.data.error || 'Failed to send SMS',
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});


router.post('/verify-code', async (req, res) => {
  const { phoneNumber, code, deviceId, deviceInfo } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    const otherUser = await User.findOne({ "devices.deviceId": deviceId });
    if (otherUser && otherUser.phoneNumber !== phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: 'Device is already bound to another user' });
    }

    if (user.devices.some(device => device.deviceId === deviceId)) {
      return res.status(200).json({
        success: true,
        message: 'Device already bound',
        devices: user.devices,
      });
    }

    if (deviceId && deviceInfo) {
      user.devices.push({
        deviceId,
        deviceInfo: { ...deviceInfo, status: 'active' },
      });
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Device bound successfully',
        devices: user.devices,
      });
    }

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      devices: user.devices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;