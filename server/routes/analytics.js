const express = require('express');
const Asset = require('../models/Asset');
const Trade = require('../models/Trade');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get platform analytics
router.get('/platform', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Calculate time range
    let hours;
    switch (period) {
      case '1h': hours = 1; break;
      case '24h': hours = 24; break;
      case '7d': hours = 24 * 7; break;
      case '30d': hours = 24 * 30; break;
      default: hours = 24;
    }
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get platform metrics
    const [
      totalAssets,
      totalUsers,
      totalTrades,
      totalVolume,
      recentTrades
    ] = await Promise.all([
      Asset.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Trade.countDocuments({ 
        status: 'completed',
        completedAt: { $gte: startTime }
      }),
      Trade.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$totalValue' }
          }
        }
      ]),
      Trade.find({
        status: 'completed',
        completedAt: { $gte: startTime }
      }).countDocuments()
    ]);
    
    // Get top assets by volume
    const topAssets = await Trade.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: '$asset',
          volume: { $sum: '$totalValue' },
          trades: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'asset'
        }
      },
      {
        $unwind: '$asset'
      },
      {
        $sort: { volume: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.json({
      period,
      metrics: {
        totalAssets,
        totalUsers,
        totalTrades,
        totalVolume: totalVolume[0]?.totalVolume || 0,
        recentTrades
      },
      topAssets
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

// Get user analytics
router.get('/user', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate time range
    let days;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 30;
    }
    
    const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get user trading stats
    const tradingStats = await Trade.aggregate([
      {
        $match: {
          $or: [{ buyer: req.userId }, { seller: req.userId }],
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
    
    // Get portfolio composition
    const user = await User.findById(req.userId);
    const portfolioValue = await user.getPortfolioValue();
    
    // Get trading performance over time
    const performanceData = await Trade.aggregate([
      {
        $match: {
          $or: [{ buyer: req.userId }, { seller: req.userId }],
          status: 'completed',
          completedAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt'
            }
          },
          volume: { $sum: '$totalValue' },
          trades: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    res.json({
      period,
      tradingStats: tradingStats[0] || {
        totalTrades: 0,
        totalVolume: 0,
        totalFees: 0,
        avgTradeSize: 0
      },
      portfolioValue,
      portfolio: user.portfolio,
      performanceData
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Get asset analytics
router.get('/asset/:assetId', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Calculate time range
    let hours;
    switch (period) {
      case '1h': hours = 1; break;
      case '24h': hours = 24; break;
      case '7d': hours = 24 * 7; break;
      case '30d': hours = 24 * 30; break;
      default: hours = 24;
    }
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get asset
    const asset = await Asset.findById(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Get trading metrics
    const tradingMetrics = await Trade.aggregate([
      {
        $match: {
          asset: asset._id,
          status: 'completed',
          completedAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          volume: { $sum: '$totalValue' },
          trades: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);
    
    // Get price history
    const priceHistory = asset.priceHistory
      .filter(p => p.timestamp >= startTime)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Get holder distribution (simplified)
    const holders = await User.aggregate([
      {
        $match: {
          'portfolio.tokenAddress': asset.tokenAddress
        }
      },
      {
        $unwind: '$portfolio'
      },
      {
        $match: {
          'portfolio.tokenAddress': asset.tokenAddress
        }
      },
      {
        $group: {
          _id: null,
          totalHolders: { $sum: 1 },
          totalTokens: { $sum: '$portfolio.amount' },
          avgHolding: { $avg: '$portfolio.amount' }
        }
      }
    ]);
    
    res.json({
      asset: {
        name: asset.name,
        symbol: asset.symbol,
        currentPrice: asset.currentPrice,
        marketCap: asset.marketCap,
        change24h: asset.change24h
      },
      tradingMetrics: tradingMetrics[0] || {
        volume: 0,
        trades: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0
      },
      holders: holders[0] || {
        totalHolders: 0,
        totalTokens: 0,
        avgHolding: 0
      },
      priceHistory,
      period
    });
  } catch (error) {
    console.error('Get asset analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch asset analytics' });
  }
});

module.exports = router;