require('dotenv').config();

function validateOpKey(operation) {
  return (req, res, next) => {
    const opKey = req.headers['x-op-key'];

    if (!opKey) {
      return res.status(403).json({ success: false, message: 'Operation key missing' });
    }

    const validKey = process.env[`OP_KEY_${operation.toUpperCase()}`];
    if (opKey !== validKey) {
      return res.status(403).json({ success: false, message: 'Invalid operation key' });
    }

    next();
  };
}

module.exports = validateOpKey;