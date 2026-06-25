const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

router.post('/heartbeat', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.isPremium) {
      // Check if premium is expired
      if (user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
        user.isPremium = false;
        await user.save();
        return res.status(403).json({ message: 'TRIAL_EXPIRED', usedTrialTime: user.usedTrialTime });
      }
      return res.json({ message: 'Premium active', usedTrialTime: user.usedTrialTime });
    }
    
    const now = new Date();
    if (user.lastHeartbeatAt) {
      const diffSeconds = Math.floor((now - user.lastHeartbeatAt) / 1000);
      // Cap increment at 60s per ping to handle offline/idle time correctly
      const increment = diffSeconds > 0 ? Math.min(diffSeconds, 60) : 0;
      user.usedTrialTime += increment;
    } else {
      user.usedTrialTime += 0; // First ping initializes the timer without adding 60s
    }
    
    user.lastHeartbeatAt = now;
    
    if (user.usedTrialTime >= 1800) { // 30 minutes = 1800 seconds
      await user.save();
      return res.status(403).json({ message: 'TRIAL_EXPIRED', usedTrialTime: user.usedTrialTime });
    }
    
    await user.save();
    res.json({ message: 'Timer updated', usedTrialTime: user.usedTrialTime });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isPremium && (!user.premiumExpiresAt || new Date() <= user.premiumExpiresAt)) {
      return res.json({ status: 'premium' });
    }
    if (user.usedTrialTime >= 1800) {
      return res.json({ status: 'expired' });
    }
    res.json({ status: 'trial', timeRemaining: 1800 - user.usedTrialTime });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
