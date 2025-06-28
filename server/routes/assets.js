const express = require('express');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all assets
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      sortBy = 'marketCap', 
      order = 'desc', 
      limit = 50,
      search 
    } = req.query;
    
    let query = { isActive: true, isListed: true };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortOrder };
    
    const assets = await Asset.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .select('-priceHistory'); // Exclude price history for performance
    
    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get single asset
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Get asset by symbol
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const asset = await Asset.findOne({ 
      symbol: req.params.symbol.toUpperCase(),
      isActive: true 
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    console.error('Get asset by symbol error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Get asset price history
router.get('/:id/price-history', async (req, res) => {
  try {
    const { period = '24h', interval = '1h' } = req.query;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Calculate time range
    let hours;
    switch (period) {
      case '1h': hours = 1; break;
      case '24h': hours = 24; break;
      case '7d': hours = 24 * 7; break;
      case '30d': hours = 24 * 30; break;
      case '1y': hours = 24 * 365; break;
      default: hours = 24;
    }
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Filter price history
    const priceHistory = asset.priceHistory
      .filter(p => p.timestamp >= startTime)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    res.json(priceHistory);
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Get market stats
router.get('/stats/market', async (req, res) => {
  try {
    const stats = await Asset.aggregate([
      { $match: { isActive: true, isListed: true } },
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalMarketCap: { $sum: '$marketCap' },
          totalVolume24h: { $sum: '$volume24h' },
          avgChange24h: { $avg: '$change24h' }
        }
      }
    ]);
    
    const categoryStats = await Asset.aggregate([
      { $match: { isActive: true, isListed: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          marketCap: { $sum: '$marketCap' },
          volume24h: { $sum: '$volume24h' }
        }
      }
    ]);
    
    res.json({
      overall: stats[0] || {
        totalAssets: 0,
        totalMarketCap: 0,
        totalVolume24h: 0,
        avgChange24h: 0
      },
      byCategory: categoryStats
    });
  } catch (error) {
    console.error('Get market stats error:', error);
    res.status(500).json({ error: 'Failed to fetch market stats' });
  }
});

// Create asset (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const assetData = req.body;
    
    const asset = new Asset(assetData);
    await asset.save();
    
    res.status(201).json({
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset price
router.put('/:id/price', auth, async (req, res) => {
  try {
    const { price, source = 'manual', confidence = 95 } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    asset.addPriceHistory(price, source, confidence);
    asset.calculateMarketMetrics();
    await asset.save();
    
    res.json({
      message: 'Price updated successfully',
      currentPrice: asset.currentPrice,
      change24h: asset.change24h
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

module.exports = router;