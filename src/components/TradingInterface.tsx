import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { mockAssets } from '../data/mockData';

interface TradingInterfaceProps {
  selectedAsset: any;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ selectedAsset }) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [orderMode, setOrderMode] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  const asset = selectedAsset || mockAssets[0];
  const estimatedTotal = parseFloat(amount || '0') * asset.price;
  const estimatedFees = estimatedTotal * 0.003; // 0.3% fee
  const finalAmount = orderType === 'buy' ? estimatedTotal + estimatedFees : estimatedTotal - estimatedFees;

  const recentTrades = [
    { type: 'buy', amount: 1.5, price: 2456.78, time: '2 min ago' },
    { type: 'sell', amount: 3.2, price: 2454.32, time: '5 min ago' },
    { type: 'buy', amount: 0.8, price: 2458.91, time: '8 min ago' },
    { type: 'sell', amount: 2.1, price: 2453.45, time: '12 min ago' },
  ];

  const handleTrade = () => {
    // Trading logic would go here
    console.log('Trade executed:', { orderType, amount, asset: asset.symbol });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Trading Interface</h1>
        <p className="text-slate-400">Execute trades with AI-powered insights and cross-chain capabilities</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <motion.div
          className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Asset Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">{asset.symbol.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{asset.name}</h2>
              <p className="text-slate-400">{asset.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${asset.price.toFixed(2)}</p>
              <div className={`flex items-center space-x-1 ${
                asset.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {asset.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Order Type Selection */}
          <div className="flex space-x-1 mb-6 bg-slate-700/30 p-1 rounded-lg">
            <button
              onClick={() => setOrderType('buy')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                orderType === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buy {asset.symbol}
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                orderType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sell {asset.symbol}
            </button>
          </div>

          {/* Order Mode */}
          <div className="flex space-x-1 mb-6 bg-slate-700/30 p-1 rounded-lg">
            <button
              onClick={() => setOrderMode('market')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                orderMode === 'market'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Market Order
            </button>
            <button
              onClick={() => setOrderMode('limit')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                orderMode === 'limit'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Limit Order
            </button>
          </div>

          {/* Order Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Amount ({asset.symbol})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {orderMode === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Limit Price (USD)
                </label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder={asset.price.toFixed(2)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Slippage Tolerance (%)
              </label>
              <div className="flex space-x-2">
                {['0.1', '0.5', '1.0', '2.0'].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      slippage === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  step="0.1"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-700/30 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Estimated Total</span>
              <span className="text-white">${estimatedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Trading Fees (0.3%)</span>
              <span className="text-white">${estimatedFees.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-600 pt-2 flex justify-between font-medium">
              <span className="text-slate-400">
                {orderType === 'buy' ? 'Total Cost' : 'You Receive'}
              </span>
              <span className="text-white">${finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              orderType === 'buy'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-slate-600'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-slate-600'
            } text-white disabled:cursor-not-allowed`}
          >
            {orderType === 'buy' ? 'Buy' : 'Sell'} {asset.symbol}
          </button>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* AI Insights */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>AI Trading Insights</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Strong buy signal detected</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-300">Low volatility period</span>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Predicted Price (24h)</p>
                <p className="text-lg font-bold text-green-400">
                  ${(asset.price * 1.023).toFixed(2)} (+2.3%)
                </p>
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Recent Trades</span>
            </h3>
            <div className="space-y-3">
              {recentTrades.map((trade, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      trade.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-sm text-slate-300 capitalize">{trade.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{trade.amount} @ ${trade.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{trade.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingInterface;