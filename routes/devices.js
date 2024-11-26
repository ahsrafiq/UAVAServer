const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/bind-device', async (req, res) => {
    const { userId, deviceId, deviceInfo } = req.body;
  
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const deviceExists = user.devices.some(device => device.deviceId === deviceId);
  
      if (deviceExists) {
        await User.updateOne(
          { userId, "devices.deviceId": deviceId },
          { $set: { "devices.$.deviceInfo": { ...deviceInfo, status: "active" } } }
        );
        return res.status(200).json({ success: true, message: 'Device status updated to active' });
      } else {
        await User.updateOne(
          { userId },
          {
            $push: {
              devices: {
                deviceId,
                deviceInfo: { 
                    ...deviceInfo, 
                    status: "active" },
              },
            },
          }
        );
        return res.status(200).json({ success: true, message: 'Device added successfully' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  router.post('/unbind-device', async (req, res) => {
    const { userId, deviceId } = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { userId, "devices.deviceId": deviceId },
        {
          $set: { "devices.$.deviceInfo.status": "inactive" },
        },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User or device not found" });
      }
  
      res.status(200).json({ success: true, message: "Device unbound successfully (marked as inactive)" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  module.exports = router;