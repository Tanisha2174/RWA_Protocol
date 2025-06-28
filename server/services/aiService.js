const tf = require('@tensorflow/tfjs-node');

class AIService {
  constructor() {
    this.models = new Map();
    this.initializeModels();
  }

  async initializeModels() {
    // In a real implementation, you would load pre-trained models
    console.log('Initializing AI models...');
    
    // Mock model initialization
    this.models.set('pricePredictor', {
      predict: this.mockPricePredictor.bind(this)
    });
    
    this.models.set('riskAnalyzer', {
      analyze: this.mockRiskAnalyzer.bind(this)
    });
    
    this.models.set('sentimentAnalyzer', {
      analyze: this.mockSentimentAnalyzer.bind(this)
    });
  }

  async generatePredictions(asset) {
    try {
      // Extract features from price history
      const features = this.extractFeatures(asset.priceHistory);
      
      // Generate predictions using mock model
      const model = this.models.get('pricePredictor');
      const predictions = await model.predict(features);
      
      return {
        price24h: predictions.price24h,
        price7d: predictions.price7d,
        price30d: predictions.price30d,
        confidence: predictions.confidence,
        trend: predictions.trend,
        signals: predictions.signals,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error generating predictions:', error);
      throw error;
    }
  }

  async analyzePortfolioRisk(portfolio) {
    try {
      const Asset = require('../models/Asset');
      
      let totalValue = 0;
      let weightedRisk = 0;
      const assetRisks = [];
      
      for (const holding of portfolio) {
        const asset = await Asset.findOne({ tokenAddress: holding.tokenAddress });
        if (asset) {
          const value = holding.amount * asset.currentPrice;
          totalValue += value;
          weightedRisk += asset.riskScore * value;
          
          assetRisks.push({
            symbol: asset.symbol,
            riskScore: asset.riskScore,
            allocation: 0, // Will be calculated below
            value
          });
        }
      }
      
      // Calculate allocations
      assetRisks.forEach(risk => {
        risk.allocation = (risk.value / totalValue) * 100;
      });
      
      const overallRisk = totalValue > 0 ? weightedRisk / totalValue : 0;
      
      // Generate recommendations
      const recommendations = this.generateRiskRecommendations(overallRisk, assetRisks);
      
      return {
        overallRisk: overallRisk.toFixed(1),
        riskScore: this.getRiskLabel(overallRisk),
        assetRisks,
        recommendations,
        diversificationScore: this.calculateDiversificationScore(assetRisks),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error analyzing portfolio risk:', error);
      throw error;
    }
  }

  async getMarketSentiment() {
    try {
      // Mock sentiment analysis
      const sentiments = [
        { source: 'Social Media', score: 0.65, trend: 'positive' },
        { source: 'News Articles', score: 0.45, trend: 'neutral' },
        { source: 'Market Data', score: 0.78, trend: 'positive' },
        { source: 'Expert Analysis', score: 0.55, trend: 'neutral' }
      ];
      
      const overallScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
      
      return {
        overallScore,
        overallTrend: overallScore > 0.6 ? 'positive' : overallScore < 0.4 ? 'negative' : 'neutral',
        sentiments,
        confidence: 0.85,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      throw error;
    }
  }

  async generateTradingSignals(asset, timeframe) {
    try {
      const signals = [];
      
      // Mock signal generation based on price history
      const recentPrices = asset.priceHistory.slice(-20);
      if (recentPrices.length < 10) {
        return { signals: [], confidence: 0 };
      }
      
      // Simple moving average crossover
      const shortMA = this.calculateMA(recentPrices.slice(-5));
      const longMA = this.calculateMA(recentPrices.slice(-10));
      
      if (shortMA > longMA) {
        signals.push({
          type: 'BUY',
          strength: 'STRONG',
          reason: 'Short MA crossed above Long MA',
          confidence: 0.75
        });
      } else if (shortMA < longMA) {
        signals.push({
          type: 'SELL',
          strength: 'MODERATE',
          reason: 'Short MA below Long MA',
          confidence: 0.65
        });
      }
      
      // RSI-like indicator
      const rsi = this.calculateMockRSI(recentPrices);
      if (rsi > 70) {
        signals.push({
          type: 'SELL',
          strength: 'MODERATE',
          reason: 'Overbought conditions detected',
          confidence: 0.60
        });
      } else if (rsi < 30) {
        signals.push({
          type: 'BUY',
          strength: 'STRONG',
          reason: 'Oversold conditions detected',
          confidence: 0.80
        });
      }
      
      return {
        signals,
        timeframe,
        confidence: signals.length > 0 ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length : 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error generating trading signals:', error);
      throw error;
    }
  }

  async getMarketSignals(timeframe) {
    try {
      const Asset = require('../models/Asset');
      const assets = await Asset.find({ isActive: true, isListed: true }).limit(10);
      
      const marketSignals = [];
      
      for (const asset of assets) {
        const signals = await this.generateTradingSignals(asset, timeframe);
        if (signals.signals.length > 0) {
          marketSignals.push({
            asset: {
              id: asset._id,
              name: asset.name,
              symbol: asset.symbol,
              price: asset.currentPrice
            },
            signals: signals.signals
          });
        }
      }
      
      return {
        marketSignals,
        timeframe,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting market signals:', error);
      throw error;
    }
  }

  async getAIPerformanceMetrics() {
    try {
      // Mock performance metrics
      const metrics = {
        predictionAccuracy: {
          overall: 94.3,
          price24h: 92.1,
          price7d: 89.5,
          price30d: 87.2
        },
        riskDetection: {
          accuracy: 97.8,
          falsePositives: 2.1,
          falseNegatives: 0.1
        },
        tradingSignals: {
          successRate: 76.4,
          avgReturn: 8.3,
          sharpeRatio: 1.85
        },
        modelVersions: {
          pricePredictor: 'v2.1.3',
          riskAnalyzer: 'v1.8.7',
          sentimentAnalyzer: 'v1.5.2'
        },
        lastUpdated: new Date()
      };
      
      return metrics;
    } catch (error) {
      console.error('Error getting AI performance metrics:', error);
      throw error;
    }
  }

  async generatePortfolioRecommendations(portfolio, riskTolerance) {
    try {
      const recommendations = [];
      
      // Analyze current portfolio
      const riskAnalysis = await this.analyzePortfolioRisk(portfolio);
      
      // Generate recommendations based on risk tolerance
      if (riskTolerance === 'low' && riskAnalysis.overallRisk > 5) {
        recommendations.push({
          type: 'REBALANCE',
          priority: 'HIGH',
          action: 'Reduce exposure to high-risk assets',
          reason: 'Portfolio risk exceeds your tolerance level'
        });
      }
      
      if (riskAnalysis.diversificationScore < 0.6) {
        recommendations.push({
          type: 'DIVERSIFY',
          priority: 'MEDIUM',
          action: 'Add assets from different categories',
          reason: 'Portfolio lacks diversification'
        });
      }
      
      // Asset-specific recommendations
      const Asset = require('../models/Asset');
      const trendingAssets = await Asset.find({
        isActive: true,
        isListed: true,
        change24h: { $gt: 5 }
      }).limit(3);
      
      if (trendingAssets.length > 0) {
        recommendations.push({
          type: 'OPPORTUNITY',
          priority: 'LOW',
          action: `Consider ${trendingAssets[0].symbol} - showing strong momentum`,
          reason: 'AI detected positive trend signals'
        });
      }
      
      return {
        recommendations,
        portfolioScore: this.calculatePortfolioScore(riskAnalysis),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error generating portfolio recommendations:', error);
      throw error;
    }
  }

  async runMarketAnalysis() {
    try {
      const Asset = require('../models/Asset');
      const assets = await Asset.find({ isActive: true, isListed: true });
      
      const analysis = {
        marketTrend: 'BULLISH',
        volatility: 'MODERATE',
        topPerformers: [],
        riskAlerts: [],
        opportunities: [],
        timestamp: new Date()
      };
      
      // Analyze each asset
      for (const asset of assets) {
        if (asset.change24h > 10) {
          analysis.topPerformers.push({
            symbol: asset.symbol,
            change: asset.change24h
          });
        }
        
        if (asset.riskScore > 8) {
          analysis.riskAlerts.push({
            symbol: asset.symbol,
            risk: asset.riskScore,
            reason: 'High volatility detected'
          });
        }
      }
      
      return analysis;
    } catch (error) {
      console.error('Error running market analysis:', error);
      throw error;
    }
  }

  // Helper methods
  extractFeatures(priceHistory) {
    if (!priceHistory || priceHistory.length < 10) {
      return { prices: [], volumes: [], trends: [] };
    }
    
    const recent = priceHistory.slice(-20);
    return {
      prices: recent.map(p => p.price),
      timestamps: recent.map(p => p.timestamp),
      confidence: recent.map(p => p.confidence || 95)
    };
  }

  mockPricePredictor(features) {
    const currentPrice = features.prices[features.prices.length - 1] || 1000;
    const volatility = this.calculateVolatility(features.prices);
    
    return {
      price24h: currentPrice * (1 + (Math.random() - 0.5) * 0.1),
      price7d: currentPrice * (1 + (Math.random() - 0.5) * 0.2),
      price30d: currentPrice * (1 + (Math.random() - 0.5) * 0.3),
      confidence: Math.max(0.6, 1 - volatility),
      trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      signals: ['MOMENTUM_POSITIVE', 'VOLUME_INCREASING']
    };
  }

  mockRiskAnalyzer(data) {
    return {
      riskScore: Math.random() * 10,
      volatility: Math.random(),
      correlation: Math.random()
    };
  }

  mockSentimentAnalyzer(data) {
    return {
      sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
      confidence: Math.random()
    };
  }

  calculateMA(prices) {
    return prices.reduce((sum, price) => sum + price.price, 0) / prices.length;
  }

  calculateMockRSI(prices) {
    // Simplified RSI calculation
    return 30 + Math.random() * 40; // Random value between 30-70
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  getRiskLabel(riskScore) {
    if (riskScore <= 3) return 'Low Risk';
    if (riskScore <= 6) return 'Medium Risk';
    return 'High Risk';
  }

  generateRiskRecommendations(overallRisk, assetRisks) {
    const recommendations = [];
    
    if (overallRisk > 7) {
      recommendations.push('Consider reducing exposure to high-risk assets');
    }
    
    if (assetRisks.length < 3) {
      recommendations.push('Diversify your portfolio across more asset types');
    }
    
    const highRiskAssets = assetRisks.filter(a => a.riskScore > 7);
    if (highRiskAssets.length > 0) {
      recommendations.push(`Monitor ${highRiskAssets[0].symbol} closely due to high risk score`);
    }
    
    return recommendations;
  }

  calculateDiversificationScore(assetRisks) {
    if (assetRisks.length <= 1) return 0;
    
    // Simple diversification score based on allocation distribution
    const allocations = assetRisks.map(a => a.allocation);
    const maxAllocation = Math.max(...allocations);
    
    return Math.max(0, 1 - (maxAllocation / 100));
  }

  calculatePortfolioScore(riskAnalysis) {
    const riskScore = (10 - parseFloat(riskAnalysis.overallRisk)) / 10;
    const diversificationScore = riskAnalysis.diversificationScore;
    
    return ((riskScore + diversificationScore) / 2) * 100;
  }
}

module.exports = new AIService();