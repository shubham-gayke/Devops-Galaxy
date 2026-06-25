const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  const { planId, utrNumber } = req.body;
  if (!planId || !utrNumber) {
    return res.status(400).json({ message: 'Plan ID and UTR Number are required' });
  }
  
  try {
    const transaction = await Transaction.create({
      userId: req.user._id,
      planId,
      utrNumber
    });
    res.status(201).json({ message: 'Transaction submitted for verification', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
