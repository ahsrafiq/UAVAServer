const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../config/jwtMiddleware');
const validateOpKey = require('../config/opKeyMiddleware');

router.post('/bind-device', [authenticateToken, validateOpKey('bind-device')], async (req, res) => {
  const { phoneNumber, deviceId, deviceInfo } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otherUser = await User.findOne({ "devices.deviceId": deviceId });
    if (otherUser && otherUser.phoneNumber !== phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: 'Device is already bound to another user' });
    }

    user.devices.forEach(device => {
      if (device.deviceId !== deviceId) {
        device.deviceInfo.status = 'inactive';
      }
    });

    const existingDevice = user.devices.find(device => device.deviceId === deviceId);
    if (existingDevice) {
      existingDevice.deviceInfo = { ...deviceInfo, status: 'active' };
    } else {
      user.devices.push({
        deviceId,
        deviceInfo: { ...deviceInfo, status: 'active' },
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Device bound successfully, all other devices marked inactive',
      devices: user.devices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post('/unbind-device', [authenticateToken, validateOpKey('unbind-device')], async (req, res) => {
  const { phoneNumber, deviceId } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const device = user.devices.find(device => device.deviceId === deviceId);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found for this user' });
    }

    device.deviceInfo.status = 'inactive';
    await user.save();

    res.status(200).json({ success: true, message: 'Device unbound successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;