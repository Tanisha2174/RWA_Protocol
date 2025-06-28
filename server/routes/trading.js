const express = require('express');
const Trade = require('../models/Trade');
const User = require('../models/User');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's trading history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    let query = {
      $or: [
        { buyer: req.userId },
        { seller: req.userId }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const trades = await Trade.find(query)
      .populate('asset', 'name symbol')
      .populate('buyer', 'email walletAddress')
      .populate('seller', 'email walletAddress')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Trade.countDocuments(query);
    
    res.json({
      trades,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get trading history error:', error);
    res.status(500).json({ error: 'Failed to fetch trading history' });
  }
});

// Get trading stats for user
router.get('/stats', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const stats = await Trade.getUserStats(req.userId, parseInt(days));
    
    // Get portfolio performance
    const user = await User.findById(req.userId);
    const portfolioValue = await user.getPortfolioValue();
    
    // Calculate P&L (simplified)
    const totalInvested = stats.totalVolume || 0;
    const currentValue = portfolioValue || 0;
    const pnl = currentValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    
    res.json({
      ...stats,
      portfolioValue: currentValue,
      totalInvested,
      pnl,
      pnlPercentage,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get trading stats error:', error);
    res.status(500).json({ error: 'Failed to fetch trading stats' });
  }
});

// Create trade order
router.post('/order', auth, async (req, res) => {
  try {
    const {
      assetId,
      amount,
      price,
      tradeType = 'market',
      side // 'buy' or 'sell'
    } = req.body;
    
    // Validate input
    if (!assetId || !amount || !price || !side) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate fees
    const totalValue = amount * price;
    const marketplaceFee = totalValue * 0.003; // 0.3%
    const gasFee = 0.01; // Estimated gas fee
    
    // For sell orders, check if user has enough tokens
    if (side === 'sell') {
      const holding = user.portfolio.find(h => h.tokenAddress === asset.tokenAddress);
      if (!holding || holding.amount < amount) {
        return res.status(400).json({ error: 'Insufficient token balance' });
      }
    }
    
    // Create trade record
    const trade = new Trade({
      buyer: side === 'buy' ? req.userId : null,
      seller: side === 'sell' ? req.userId : null,
      asset: assetId,
      tokenAddress: asset.tokenAddress,
      amount,
      price,
      totalValue,
      marketplaceFee,
      gasFee,
      tradeType,
      status: 'pending'
    });
    
    await trade.save();
    
    // In a real implementation, this would interact with smart contracts
    // For now, we'll simulate immediate execution for market orders
    if (tradeType === 'market') {
      trade.status = 'completed';
      trade.completedAt = new Date();
      trade.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      await trade.save();
      
      // Update user portfolio
      if (side === 'buy') {
        user.addToPortfolio(asset.tokenAddress, asset.symbol, amount, price);
      } else {
        const holding = user.portfolio.find(h => h.tokenAddress === asset.tokenAddress);
        if (holding) {
          holding.amount -= amount;
          if (holding.amount <= 0) {
            user.portfolio = user.portfolio.filter(h => h.tokenAddress !== asset.tokenAddress);
          }
        }
      }
      
      await user.save();
      
      // Update asset volume
      asset.volume24h = (asset.volume24h || 0) + totalValue;
      await asset.save();
    }
    
    res.status(201).json({
      message: 'Trade order created successfully',
      trade: await Trade.findById(trade._id)
        .populate('asset', 'name symbol')
        .populate('buyer', 'email walletAddress')
        .populate('seller', 'email walletAddress')
    });
  } catch (error) {
    console.error('Create trade order error:', error);
    res.status(500).json({ error: 'Failed to create trade order' });
  }
});

// Get recent trades for an asset
router.get('/asset/:assetId/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const trades = await Trade.find({
      asset: req.params.assetId,
      status: 'completed'
    })
      .populate('buyer', 'walletAddress')
      .populate('seller', 'walletAddress')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .select('amount price totalValue completedAt buyer seller');
    
    res.json(trades);
  } catch (error) {
    console.error('Get recent trades error:', error);
    res.status(500).json({ error: 'Failed to fetch recent trades' });
  }
});

// Get order book for an asset
router.get('/asset/:assetId/orderbook', async (req, res) => {
  try {
    // In a real implementation, this would fetch active orders from the marketplace
    // For now, we'll return mock data
    const buyOrders = [
      { price: 2450.00, amount: 1.5, total: 3675.00 },
      { price: 2445.00, amount: 2.3, total: 5623.50 },
      { price: 2440.00, amount: 0.8, total: 1952.00 }
    ];
    
    const sellOrders = [
      { price: 2460.00, amount: 1.2, total: 2952.00 },
      { price: 2465.00, amount: 3.1, total: 7641.50 },
      { price: 2470.00, amount: 0.9, total: 2223.00 }
    ];
    
    res.json({
      buyOrders,
      sellOrders,
      spread: 10.00, // Difference between best bid and ask
      lastPrice: 2455.00
    });
  } catch (error) {
    console.error('Get order book error:', error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

module.exports = router;