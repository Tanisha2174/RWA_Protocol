const express = require('express');
const Asset = require('../models/Asset');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

const router = express.Router();

// Get AI predictions for an asset
router.get('/predictions/:assetId', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Get or generate AI predictions
    let predictions = asset.aiPredictions;
    
    // If predictions are older than 1 hour, generate new ones
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!predictions || !predictions.lastUpdated || predictions.lastUpdated < oneHourAgo) {
      predictions = await aiService.generatePredictions(asset);
      
      asset.aiPredictions = predictions;
      await asset.save();
    }
    
    res.json(predictions);
  } catch (error) {
    console.error('Get AI predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch AI predictions' });
  }
});

// Get market sentiment analysis
router.get('/sentiment', async (req, res) => {
  try {
    const sentiment = await aiService.getMarketSentiment();
    res.json(sentiment);
  } catch (error) {
    console.error('Get sentiment error:', error);
    res.status(500).json({ error: 'Failed to fetch market sentiment' });
  }
});

// Get risk analysis for portfolio
router.get('/risk-analysis', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user || !user.portfolio.length) {
      return res.json({
        overallRisk: 0,
        riskScore: 'N/A',
        recommendations: ['Build a diversified portfolio to get risk analysis']
      });
    }
    
    const riskAnalysis = await aiService.analyzePortfolioRisk(user.portfolio);
    res.json(riskAnalysis);
  } catch (error) {
    console.error('Get risk analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch risk analysis' });
  }
});

// Get trading signals
router.get('/signals', async (req, res) => {
  try {
    const { assetId, timeframe = '1h' } = req.query;
    
    let signals;
    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      signals = await aiService.generateTradingSignals(asset, timeframe);
    } else {
      signals = await aiService.getMarketSignals(timeframe);
    }
    
    res.json(signals);
  } catch (error) {
    console.error('Get trading signals error:', error);
    res.status(500).json({ error: 'Failed to fetch trading signals' });
  }
});

// Get AI performance metrics
router.get('/performance', async (req, res) => {
  try {
    const performance = await aiService.getAIPerformanceMetrics();
    res.json(performance);
  } catch (error) {
    console.error('Get AI performance error:', error);
    res.status(500).json({ error: 'Failed to fetch AI performance metrics' });
  }
});

// Generate portfolio recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    const recommendations = await aiService.generatePortfolioRecommendations(
      user.portfolio,
      user.preferences.riskTolerance
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;