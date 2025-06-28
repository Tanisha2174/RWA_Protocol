const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, enum: ['chainlink', 'api', 'manual'], default: 'api' },
  confidence: { type: Number, min: 0, max: 100, default: 95 }
});

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  tokenAddress: { type: String, unique: true, sparse: true },
  category: {
    type: String,
    enum: ['real-estate', 'commodities', 'art', 'bonds', 'collectibles', 'environmental'],
    required: true
  },
  description: String,
  location: String,
  verification: String,
  
  // Price data
  currentPrice: { type: Number, required: true },
  priceHistory: [priceHistorySchema],
  
  // Market data
  marketCap: Number,
  volume24h: Number,
  change24h: Number,
  change7d: Number,
  change30d: Number,
  
  // Supply data
  totalSupply: Number,
  circulatingSupply: Number,
  maxSupply: Number,
  
  // Asset-specific data
  totalValue: Number, // Real-world asset value
  backingRatio: { type: Number, default: 100 }, // % of tokens backed by real assets
  
  // Risk and compliance
  riskScore: { type: Number, min: 1, max: 10, default: 5 },
  hasProofOfReserve: { type: Boolean, default: false },
  complianceStatus: {
    type: String,
    enum: ['compliant', 'pending', 'non-compliant'],
    default: 'pending'
  },
  
  // AI predictions
  aiPredictions: {
    price24h: Number,
    price7d: Number,
    price30d: Number,
    confidence: Number,
    lastUpdated: Date
  },
  
  // Metadata
  images: [String],
  documents: [String],
  externalLinks: [{
    name: String,
    url: String
  }],
  
  // Status
  isActive: { type: Boolean, default: true },
  isListed: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
assetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add price to history
assetSchema.methods.addPriceHistory = function(price, source = 'api', confidence = 95) {
  this.priceHistory.push({
    price,
    source,
    confidence,
    timestamp: new Date()
  });
  
  // Keep only last 1000 price points
  if (this.priceHistory.length > 1000) {
    this.priceHistory = this.priceHistory.slice(-1000);
  }
  
  // Update current price and calculate changes
  const oldPrice = this.currentPrice;
  this.currentPrice = price;
  
  if (oldPrice) {
    this.change24h = ((price - oldPrice) / oldPrice) * 100;
  }
};

// Calculate market metrics
assetSchema.methods.calculateMarketMetrics = function() {
  if (this.currentPrice && this.circulatingSupply) {
    this.marketCap = this.currentPrice * this.circulatingSupply;
  }
  
  // Calculate volume from recent trades (would need trade data)
  // This is a placeholder - in real implementation, calculate from actual trades
  this.volume24h = this.marketCap * 0.1; // Assume 10% daily turnover
};

// Get price change for period
assetSchema.methods.getPriceChange = function(hours) {
  const targetTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  const historicalPrice = this.priceHistory
    .filter(p => p.timestamp >= targetTime)
    .sort((a, b) => a.timestamp - b.timestamp)[0];
  
  if (historicalPrice) {
    return ((this.currentPrice - historicalPrice.price) / historicalPrice.price) * 100;
  }
  
  return 0;
};

module.exports = mongoose.model('Asset', assetSchema);