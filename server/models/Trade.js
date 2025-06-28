const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  orderId: String,
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  tokenAddress: String,
  
  // Trade details
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  
  // Fees
  marketplaceFee: Number,
  gasFee: Number,
  totalFees: Number,
  
  // Trade type
  tradeType: {
    type: String,
    enum: ['market', 'limit'],
    default: 'market'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Blockchain data
  transactionHash: String,
  blockNumber: Number,
  gasUsed: Number,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  
  // Additional metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String // web, mobile, api
  }
});

// Calculate total value and fees before saving
tradeSchema.pre('save', function(next) {
  this.totalValue = this.amount * this.price;
  this.totalFees = (this.marketplaceFee || 0) + (this.gasFee || 0);
  next();
});

// Static method to get trading volume for asset
tradeSchema.statics.getVolumeForAsset = async function(assetId, hours = 24) {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        asset: assetId,
        status: 'completed',
        completedAt: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: '$totalValue' },
        tradeCount: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);
  
  return result[0] || { totalVolume: 0, tradeCount: 0, avgPrice: 0 };
};

// Static method to get user trading stats
tradeSchema.statics.getUserStats = async function(userId, days = 30) {
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        $or: [{ buyer: userId }, { seller: userId }],
        status: 'completed',
        completedAt: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalVolume: { $sum: '$totalValue' },
        totalFees: { $sum: '$totalFees' },
        avgTradeSize: { $avg: '$totalValue' }
      }
    }
  ]);
  
  return result[0] || { totalTrades: 0, totalVolume: 0, totalFees: 0, avgTradeSize: 0 };
};

module.exports = mongoose.model('Trade', tradeSchema);