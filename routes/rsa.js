const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();


router.get('/rsa-public-key', (req, res) => {
  try {
    const publicKey = fs.readFileSync(path.join(__dirname, '../keys/public.key'), 'utf8');
    res.status(200).json({ publicKey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load public key' });
  }
});

module.exports = router;