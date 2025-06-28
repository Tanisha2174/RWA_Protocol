import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Shield, 
  Clock, 
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';

interface CrossChainBridgeProps {
  selectedAsset?: any;
}

const CrossChainBridge: React.FC<CrossChainBridgeProps> = ({ selectedAsset }) => {
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('polygon');
  const [selectedAssetId, setSelectedAssetId] = useState('gold-token');
  const [amount, setAmount] = useState('');
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'bridging' | 'success'>('idle');

  // Set selected asset if passed from props
  useEffect(() => {
    if (selectedAsset) {
      setSelectedAssetId(selectedAsset.id);
      // Optionally set a default amount
      setAmount('1.0');
    }
  }, [selectedAsset]);

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '🔵', gasPrice: '25 gwei' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', gasPrice: '30 gwei' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔴', gasPrice: '0.1 gwei' },
    { id: 'optimism', name: 'Optimism', icon: '🔴', gasPrice: '0.001 gwei' },
    { id: 'bsc', name: 'BSC', icon: '🟡', gasPrice: '5 gwei' },
  ];

  const assets = [
    { id: 'gold-token', name: 'Gold Token', symbol: 'GOLD', balance: '15.234' },
    { id: 're-reit', name: 'Real Estate REIT', symbol: 'REIT', balance: '8.567' },
    { id: 'art-collection', name: 'Art Collection', symbol: 'ART', balance: '3.123' },
    { id: 'treasury-bonds', name: 'Treasury Bonds', symbol: 'BOND', balance: '25.891' },
  ];

  const recentTransactions = [
    { 
      id: '1', 
      asset: 'GOLD', 
      amount: '5.0', 
      from: 'Ethereum', 
      to: 'Polygon', 
      status: 'completed',
      time: '2 hours ago'
    },
    { 
      id: '2', 
      asset: 'REIT', 
      amount: '2.5', 
      from: 'Polygon', 
      to: 'Arbitrum', 
      status: 'pending',
      time: '5 hours ago'
    },
    { 
      id: '3', 
      asset: 'ART', 
      amount: '1.0', 
      from: 'Arbitrum', 
      to: 'Ethereum', 
      status: 'completed',
      time: '1 day ago'
    },
  ];

  const selectedAssetData = assets.find(a => a.id === selectedAssetId);
  const fromChainData = chains.find(c => c.id === fromChain);
  const toChainData = chains.find(c => c.id === toChain);
  
  const estimatedFee = parseFloat(amount || '0') * 0.001; // 0.1% bridge fee
  const estimatedTime = fromChain === 'ethereum' ? '15-20 min' : '2-5 min';

  const handleBridge = async () => {
    setBridgeStatus('bridging');
    // Simulate bridge transaction
    setTimeout(() => {
      setBridgeStatus('success');
      setTimeout(() => setBridgeStatus('idle'), 3000);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Cross-Chain Bridge</h1>
        <p className="text-slate-400">Transfer your RWA tokens seamlessly across different blockchains</p>
        {selectedAsset && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400">
              Ready to bridge <span className="font-bold">{selectedAsset.name} ({selectedAsset.symbol})</span>
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bridge Interface */}
        <motion.div
          className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Chain Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Select Networks</h2>
            <div className="flex items-center space-x-4">
              {/* From Chain */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">From</label>
                <select
                  value={fromChain}
                  onChange={(e) => setFromChain(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Gas: {fromChainData?.gasPrice}</p>
              </div>

              {/* Switch Button */}
              <button
                onClick={() => {
                  const temp = fromChain;
                  setFromChain(toChain);
                  setToChain(temp);
                }}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 mt-6"
              >
                <ArrowRightLeft className="w-5 h-5 text-white" />
              </button>

              {/* To Chain */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">To</label>
                <select
                  value={toChain}
                  onChange={(e) => setToChain(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {chains.filter(c => c.id !== fromChain).map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Gas: {toChainData?.gasPrice}</p>
              </div>
            </div>
          </div>

          {/* Asset Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Select Asset</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} - {asset.name} (Balance: {asset.balance})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-400">Amount</label>
              <button
                onClick={() => setAmount(selectedAssetData?.balance || '0')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Max: {selectedAssetData?.balance} {selectedAssetData?.symbol}
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Bridge Summary */}
          <div className="bg-slate-700/30 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Bridge Fee</span>
              <span className="text-white">{estimatedFee.toFixed(4)} {selectedAssetData?.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Estimated Time</span>
              <span className="text-white">{estimatedTime}</span>
            </div>
            <div className="border-t border-slate-600 pt-2 flex justify-between font-medium">
              <span className="text-slate-400">You'll Receive</span>
              <span className="text-white">
                {(parseFloat(amount || '0') - estimatedFee).toFixed(4)} {selectedAssetData?.symbol}
              </span>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={!amount || parseFloat(amount) <= 0 || bridgeStatus === 'bridging'}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              bridgeStatus === 'bridging'
                ? 'bg-yellow-600 cursor-not-allowed'
                : bridgeStatus === 'success'
                ? 'bg-green-600'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600'
            } text-white disabled:cursor-not-allowed`}
          >
            {bridgeStatus === 'bridging' && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Bridging...</span>
              </div>
            )}
            {bridgeStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Bridge Successful!</span>
              </div>
            )}
            {bridgeStatus === 'idle' && `Bridge ${selectedAssetData?.symbol}`}
          </button>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Bridge Status */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Bridge Status</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">CCIP Integration Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Cross-chain verification enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Security protocols active</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Recent Bridges</span>
            </h3>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {tx.amount} {tx.asset}
                    </span>
                    <div className={`flex items-center space-x-1 text-xs ${
                      tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {tx.status === 'completed' ? 
                        <CheckCircle2 className="w-3 h-3" /> : 
                        <Clock className="w-3 h-3" />
                      }
                      <span className="capitalize">{tx.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {tx.from} → {tx.to}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {tx.time}
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

export default CrossChainBridge;