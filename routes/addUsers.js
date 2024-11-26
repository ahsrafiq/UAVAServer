const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

router.post('/addUser', async (req, res) => {
  const verificationId = uuidv4();
  const { userId, phoneNumber, isVerified, devices } = req.body;
  
  try {
    const newUser = new User({
      userId,
      phoneNumber,
      verificationId,
      isVerified,
      devices,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: 'User added successfully', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;