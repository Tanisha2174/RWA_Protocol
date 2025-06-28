const axios = require('axios');
const Asset = require('../models/Asset');

class PriceService {
  constructor() {
    this.apiKeys = {
      coinGecko: process.env.COINGECKO_API_KEY,
      alphavantage: process.env.ALPHAVANTAGE_API_KEY,
      polygon: process.env.POLYGON_API_KEY
    };
    
    this.priceFeeds = new Map();
    this.initializePriceFeeds();
  }

  initializePriceFeeds() {
    // Map asset symbols to external price feeds
    this.priceFeeds.set('GOLD', {
      source: 'alphavantage',
      symbol: 'XAU',
      multiplier: 1
    });
    
    this.priceFeeds.set('REIT', {
      source: 'polygon',
      symbol: 'VNQ', // Vanguard Real Estate ETF as proxy
      multiplier: 20 // Adjust for tokenization ratio
    });
    
    this.priceFeeds.set('ART', {
      source: 'custom',
      basePrice: 24000,
      volatility: 0.05
    });
    
    this.priceFeeds.set('BOND', {
      source: 'alphavantage',
      symbol: 'TLT', // 20+ Year Treasury Bond ETF
      multiplier: 10
    });
  }

  async updateAllPrices() {
    try {
      const assets = await Asset.find({ isActive: true, isListed: true });
      const updatedPrices = [];
      
      for (const asset of assets) {
        try {
          const newPrice = await this.fetchPrice(asset.symbol);
          if (newPrice && newPrice !== asset.currentPrice) {
            asset.addPriceHistory(newPrice, 'api', 95);
            asset.calculateMarketMetrics();
            await asset.save();
            
            updatedPrices.push({
              symbol: asset.symbol,
              oldPrice: asset.currentPrice,
              newPrice,
              change: ((newPrice - asset.currentPrice) / asset.currentPrice) * 100
            });
          }
        } catch (error) {
          console.error(`Error updating price for ${asset.symbol}:`, error);
        }
      }
      
      return updatedPrices;
    } catch (error) {
      console.error('Error updating all prices:', error);
      throw error;
    }
  }

  async fetchPrice(symbol) {
    const feed = this.priceFeeds.get(symbol);
    if (!feed) {
      return this.generateMockPrice(symbol);
    }
    
    try {
      switch (feed.source) {
        case 'alphavantage':
          return await this.fetchAlphaVantagePrice(feed.symbol, feed.multiplier);
        case 'polygon':
          return await this.fetchPolygonPrice(feed.symbol, feed.multiplier);
        case 'coingecko':
          return await this.fetchCoinGeckoPrice(feed.symbol);
        case 'custom':
          return this.generateCustomPrice(feed);
        default:
          return this.generateMockPrice(symbol);
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return this.generateMockPrice(symbol);
    }
  }

  async fetchAlphaVantagePrice(symbol, multiplier = 1) {
    if (!this.apiKeys.alphavantage) {
      throw new Error('Alpha Vantage API key not configured');
    }
    
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKeys.alphavantage}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data['Global Quote'];
    
    if (!data || !data['05. price']) {
      throw new Error('Invalid response from Alpha Vantage');
    }
    
    return parseFloat(data['05. price']) * multiplier;
  }

  async fetchPolygonPrice(symbol, multiplier = 1) {
    if (!this.apiKeys.polygon) {
      throw new Error('Polygon API key not configured');
    }
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.apiKeys.polygon}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;
    
    if (!data.results || data.results.length === 0) {
      throw new Error('Invalid response from Polygon');
    }
    
    return data.results[0].c * multiplier; // Close price
  }

  async fetchCoinGeckoPrice(coinId) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;
    
    if (!data[coinId] || !data[coinId].usd) {
      throw new Error('Invalid response from CoinGecko');
    }
    
    return data[coinId].usd;
  }

  generateCustomPrice(feed) {
    // Generate price based on base price and volatility
    const { basePrice, volatility } = feed;
    const change = (Math.random() - 0.5) * 2 * volatility;
    return basePrice * (1 + change);
  }

  generateMockPrice(symbol) {
    // Generate realistic mock prices for testing
    const basePrices = {
      'GOLD': 2456.78,
      'REIT': 4892.34,
      'ART': 24378.92,
      'BOND': 1000.15,
      'COMM': 1876.43,
      'WATCH': 15678.90,
      'WINE': 3245.67,
      'CARBON': 45.78
    };
    
    const basePrice = basePrices[symbol] || 1000;
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility;
    
    return basePrice * (1 + change);
  }

  async getPriceHistory(symbol, period = '24h') {
    try {
      const asset = await Asset.findOne({ symbol });
      if (!asset) {
        throw new Error('Asset not found');
      }
      
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
      
      return asset.priceHistory
        .filter(p => p.timestamp >= startTime)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  }

  async getMarketData() {
    try {
      const assets = await Asset.find({ isActive: true, isListed: true });
      
      const marketData = {
        totalMarketCap: 0,
        totalVolume24h: 0,
        assetsCount: assets.length,
        topGainers: [],
        topLosers: [],
        lastUpdated: new Date()
      };
      
      // Calculate totals and find top gainers/losers
      assets.forEach(asset => {
        marketData.totalMarketCap += asset.marketCap || 0;
        marketData.totalVolume24h += asset.volume24h || 0;
        
        if (asset.change24h > 0) {
          marketData.topGainers.push({
            symbol: asset.symbol,
            name: asset.name,
            change: asset.change24h,
            price: asset.currentPrice
          });
        } else if (asset.change24h < 0) {
          marketData.topLosers.push({
            symbol: asset.symbol,
            name: asset.name,
            change: asset.change24h,
            price: asset.currentPrice
          });
        }
      });
      
      // Sort and limit
      marketData.topGainers.sort((a, b) => b.change - a.change).slice(0, 5);
      marketData.topLosers.sort((a, b) => a.change - b.change).slice(0, 5);
      
      return marketData;
    } catch (error) {
      console.error('Error getting market data:', error);
      throw error;
    }
  }
}

module.exports = new PriceService();