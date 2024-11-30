require('dotenv').config();

function validateOpKey(operation) {
  return (req, res, next) => {
    const opKey = req.headers['x-op-key'];
    if (!opKey) {
      return res.status(403).json({ success: false, message: 'Operation key missing' });
    }

    const operationKey = String(operation || '').toUpperCase().replace(/-/g, '_');
    const validKey = process.env[`OP_KEY_${operationKey}`];

    if (!validKey) {
      return res.status(500).json({ success: false, message: `Operation key not configured for ${operation}` });
    }

    if (opKey !== validKey) {
      return res.status(403).json({ success: false, message: 'Invalid operation key' });
    }

    next();
  };
}

module.exports = validateOpKey;