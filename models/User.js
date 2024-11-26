const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  deviceInfo: {
    name: { type: String },
    model: { type: String },
    status: { type: String },
  },
});

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  verificationId: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  devices: [DeviceSchema],
});

module.exports = mongoose.model('User', UserSchema);