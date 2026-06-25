const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  usedTrialTime: { type: Number, default: 0 }, // in seconds
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  lastHeartbeatAt: { type: Date, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
