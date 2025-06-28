import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Shield, Zap, Shuffle } from 'lucide-react';
import { mockAssets } from '../data/mockData';

interface AssetListProps {
  onSelectAsset: (asset: any) => void;
  onBridgeAsset: (asset: any) => void;
}

const AssetList: React.FC<AssetListProps> = ({ onSelectAsset, onBridgeAsset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [filterBy, setFilterBy] = useState('all');

  const filteredAssets = mockAssets
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(asset => filterBy === 'all' || asset.category === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.change - a.change;
        case 'marketCap':
        default:
          return b.marketCap - a.marketCap;
      }
    });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Asset Marketplace</h1>
        <p className="text-slate-400">Discover and trade tokenized real-world assets</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 pr-10"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="marketCap">Market Cap</option>
              <option value="price">Price</option>
              <option value="change">24h Change</option>
            </select>
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 pr-10"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All Assets</option>
              <option value="real-estate">Real Estate</option>
              <option value="commodities">Commodities</option>
              <option value="art">Art & Collectibles</option>
              <option value="bonds">Bonds</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Asset Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{asset.symbol.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">{asset.name}</h3>
                  <p className="text-slate-400 text-sm">{asset.symbol}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {asset.hasProofOfReserve && (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">${asset.price.toFixed(2)}</span>
                <div className={`flex items-center space-x-1 ${
                  asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {asset.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Market Cap</span>
                <span className="text-white">${(asset.marketCap / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">24h Volume</span>
                <span className="text-white">${(asset.volume / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">AI Risk Score</span>
                <span className={`font-medium ${
                  asset.riskScore <= 3 ? 'text-green-400' : 
                  asset.riskScore <= 6 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {asset.riskScore}/10
                </span>
              </div>
            </div>

            {/* Category Badge and Action Buttons */}
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm capitalize">
                {asset.category.replace('-', ' ')}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onSelectAsset(asset)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Trade
                </button>
                <button 
                  onClick={() => onBridgeAsset(asset)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Bridge</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AssetList;