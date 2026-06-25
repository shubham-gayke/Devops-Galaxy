const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Give free access
router.post('/free-access', protect, admin, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isPremium = true;
    user.premiumExpiresAt = null; // Lifetime
    await user.save();
    res.json({ message: 'Free access granted', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending transactions
router.get('/transactions/pending', protect, admin, async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' }).populate('userId', 'email username');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve transaction
router.post('/transactions/approve/:id', protect, admin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction already processed' });
    
    transaction.status = 'approved';
    await transaction.save();
    
    // Update user
    const user = await User.findById(transaction.userId);
    user.isPremium = true;
    
    // Calculate expiry
    const now = new Date();
    let monthsToAdd = 0;
    if (transaction.planId === '1_month') monthsToAdd = 1;
    if (transaction.planId === '3_months') monthsToAdd = 3;
    if (transaction.planId === '6_months') monthsToAdd = 9; // 6 + 3 bonus
    
    const expiry = new Date(now.setMonth(now.getMonth() + monthsToAdd));
    user.premiumExpiresAt = expiry;
    await user.save();
    
    res.json({ message: 'Transaction approved', transaction, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject transaction
router.post('/transactions/reject/:id', protect, admin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    
    transaction.status = 'rejected';
    await transaction.save();
    res.json({ message: 'Transaction rejected', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
