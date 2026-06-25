const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const OTP = require('../models/OTP');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Generate and Send OTP
router.post('/generate-otp', async (req, res) => {
  const { email, purpose } = req.body; // purpose: 'register' | 'reset_password'
  
  if (!email || !purpose) return res.status(400).json({ message: 'Email and purpose required' });

  try {
    const mongoose = require('mongoose');
    console.log('--- GENERATE OTP ---');
    console.log('Mongoose ReadyState:', mongoose.connection.readyState);
    
    const existingUser = await User.findOne({ email });
    if (purpose === 'register' && existingUser && existingUser.password) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (purpose === 'reset_password' && !existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins expiry

    await OTP.findOneAndDelete({ email, purpose }); // Clear old OTPs
    await OTP.create({ email, otp, expiresAt, purpose });
    
    console.log(`\n======================================`);
    console.log(`[DEV MODE] OTP generated for ${email}: ${otp}`);
    console.log(`======================================\n`);

    // Send via Brevo
    if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'dummy_key') {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: "Notes Subscription", email: process.env.SENDER_EMAIL || "noreply@devmastery.com" },
        to: [{ email: email }],
        subject: "Your OTP Code",
        htmlContent: `<html><body><h1>Your OTP is ${otp}</h1><p>It expires in 10 minutes.</p></body></html>`
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } else {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    let errorMessage = 'Server error';
    if (error.response && error.response.data && error.response.data.message) {
       errorMessage = `Brevo API Error: ${error.response.data.message}`;
    }
    console.error('[Generate OTP Error]:', error);
    res.status(500).json({ message: errorMessage, error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp, purpose } = req.body;
  
  try {
    const record = await OTP.findOne({ email, otp, purpose });
    if (!record) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > record.expiresAt) return res.status(400).json({ message: 'OTP expired' });

    // Optionally mark email as verified temporarily
    if (purpose === 'register') {
      let user = await User.findOne({ email });
      if (!user) {
         user = await User.create({ email, isVerified: true });
      } else {
         user.isVerified = true;
         await user.save();
      }
    }

    await OTP.findByIdAndDelete(record._id);
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Set Password & Username (After OTP Verification)
router.post('/register-complete', async (req, res) => {
  const { email, username, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) return res.status(400).json({ message: 'Email not verified' });
    
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.username = username;
    await user.save();

    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        usedTrialTime: user.usedTrialTime,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
