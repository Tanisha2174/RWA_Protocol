const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  preferences: {
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    defaultCurrency: {
      type: String,
      default: 'USD'
    }
  },
  portfolio: [{
    tokenAddress: String,
    symbol: String,
    amount: Number,
    averageBuyPrice: Number,
    lastUpdated: { type: Date, default: Date.now }
  }],
  tradingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  }],
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get portfolio value method
userSchema.methods.getPortfolioValue = async function() {
  const Asset = require('./Asset');
  let totalValue = 0;
  
  for (const holding of this.portfolio) {
    const asset = await Asset.findOne({ tokenAddress: holding.tokenAddress });
    if (asset) {
      totalValue += holding.amount * asset.currentPrice;
    }
  }
  
  return totalValue;
};

// Add to portfolio method
userSchema.methods.addToPortfolio = function(tokenAddress, symbol, amount, price) {
  const existingHolding = this.portfolio.find(h => h.tokenAddress === tokenAddress);
  
  if (existingHolding) {
    const totalAmount = existingHolding.amount + amount;
    const totalValue = (existingHolding.amount * existingHolding.averageBuyPrice) + (amount * price);
    existingHolding.amount = totalAmount;
    existingHolding.averageBuyPrice = totalValue / totalAmount;
    existingHolding.lastUpdated = Date.now();
  } else {
    this.portfolio.push({
      tokenAddress,
      symbol,
      amount,
      averageBuyPrice: price,
      lastUpdated: Date.now()
    });
  }
};

module.exports = mongoose.model('User', userSchema);