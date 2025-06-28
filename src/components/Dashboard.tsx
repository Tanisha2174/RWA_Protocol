import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Shield,
  Zap,
  Globe,
  BarChart3
} from 'lucide-react';
import PriceChart from './PriceChart';
import { mockAssets } from '../data/mockData';

interface DashboardProps {
  onSelectAsset: (asset: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectAsset }) => {
  const totalPortfolioValue = 2456789.45;
  const dayChange = 34567.23;
  const dayChangePercent = 1.42;

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: `$${totalPortfolioValue.toLocaleString()}`,
      change: `+$${dayChange.toLocaleString()}`,
      changePercent: `+${dayChangePercent}%`,
      icon: DollarSign,
      positive: true
    },
    {
      title: 'Total Assets',
      value: '12',
      change: '+2',
      changePercent: '+20%',
      icon: PieChart,
      positive: true
    },
    {
      title: 'AI Accuracy',
      value: '94.3%',
      change: '+2.1%',
      changePercent: '+2.3%',
      icon: Zap,
      positive: true
    },
    {
      title: 'Cross-Chain Volume',
      value: '$1.2M',
      change: '+$234K',
      changePercent: '+24%',
      icon: Globe,
      positive: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to RWA Protocol
        </h1>
        <p className="text-slate-400 text-lg">
          AI-powered tokenization of real-world assets with cross-chain interoperability
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.changePercent}</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                <p className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change} today
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <motion.div
          className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Portfolio Performance</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">24H</button>
              <button className="px-3 py-1 text-slate-400 hover:text-white rounded-lg text-sm">7D</button>
              <button className="px-3 py-1 text-slate-400 hover:text-white rounded-lg text-sm">30D</button>
            </div>
          </div>
          <PriceChart />
        </motion.div>

        {/* Top Assets */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Top Performing Assets</h2>
          <div className="space-y-4">
            {mockAssets.slice(0, 5).map((asset, index) => (
              <motion.div
                key={asset.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-all duration-200"
                onClick={() => onSelectAsset(asset)}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{asset.symbol.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{asset.name}</p>
                  <p className="text-slate-400 text-sm">{asset.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${asset.price.toFixed(2)}</p>
                  <div className={`flex items-center space-x-1 text-sm ${
                    asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Shield className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Proof of Reserve</h3>
          <p className="text-slate-400">
            Every token is backed by verified real-world assets with Chainlink Proof of Reserve integration.
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Zap className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">AI Price Prediction</h3>
          <p className="text-slate-400">
            Advanced AI models analyze market data to provide accurate price predictions and risk assessments.
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Globe className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Cross-Chain Trading</h3>
          <p className="text-slate-400">
            Trade assets seamlessly across Ethereum, Polygon, Arbitrum, and other supported chains.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;