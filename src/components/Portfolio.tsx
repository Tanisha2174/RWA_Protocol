import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Shield,
  Zap,
  BarChart3,
  Shuffle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioProps {
  onSelectAsset: (asset: any) => void;
  onBridgeAsset: (asset: any) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onSelectAsset, onBridgeAsset }) => {
  const portfolioData = [
    { name: 'Gold Token', value: 45, amount: 1105000, color: '#F59E0B' },
    { name: 'Real Estate REIT', value: 25, amount: 614000, color: '#3B82F6' },
    { name: 'Art Collection', value: 15, amount: 368400, color: '#8B5CF6' },
    { name: 'Treasury Bonds', value: 10, amount: 245600, color: '#10B981' },
    { name: 'Commodity ETF', value: 5, amount: 122800, color: '#EF4444' },
  ];

  const performanceData = [
    { month: 'Jan', value: 2100000 },
    { month: 'Feb', value: 2180000 },
    { month: 'Mar', value: 2250000 },
    { month: 'Apr', value: 2320000 },
    { month: 'May', value: 2380000 },
    { month: 'Jun', value: 2456000 },
  ];

  const holdings = [
    {
      id: 'gold-token',
      asset: 'Gold Token',
      symbol: 'GOLD',
      amount: '450.234',
      value: 1105000,
      change: 2.34,
      apy: 8.5,
      riskScore: 3,
      price: 2456.78
    },
    {
      id: 're-reit',
      asset: 'Real Estate REIT',
      symbol: 'REIT',
      amount: '125.567',
      value: 614000,
      change: 1.87,
      apy: 12.3,
      riskScore: 4,
      price: 4892.34
    },
    {
      id: 'art-collection',
      asset: 'Art Collection',
      symbol: 'ART',
      amount: '15.123',
      value: 368400,
      change: -0.45,
      apy: 15.7,
      riskScore: 7,
      price: 24378.92
    },
    {
      id: 'treasury-bonds',
      asset: 'Treasury Bonds',
      symbol: 'BOND',
      amount: '245.891',
      value: 245600,
      change: 0.23,
      apy: 5.2,
      riskScore: 2,
      price: 1000.15
    },
    {
      id: 'commodity-etf',
      asset: 'Commodity ETF',
      symbol: 'COMM',
      amount: '65.432',
      value: 122800,
      change: 3.12,
      apy: 9.8,
      riskScore: 5,
      price: 1876.43
    }
  ];

  const totalValue = portfolioData.reduce((sum, item) => sum + item.amount, 0);
  const totalChange = 34567.23;
  const totalChangePercent = 1.42;

  const handleTradeAsset = (holding: any) => {
    const assetData = {
      id: holding.id,
      name: holding.asset,
      symbol: holding.symbol,
      price: holding.price,
      change: holding.change,
      marketCap: holding.value * 100, // Mock market cap
      volume: holding.value * 0.1, // Mock volume
      category: holding.symbol === 'GOLD' ? 'commodities' : 
                holding.symbol === 'REIT' ? 'real-estate' :
                holding.symbol === 'ART' ? 'art' :
                holding.symbol === 'BOND' ? 'bonds' : 'commodities',
      riskScore: holding.riskScore,
      hasProofOfReserve: true
    };
    onSelectAsset(assetData);
  };

  const handleBridgeAsset = (holding: any) => {
    const assetData = {
      id: holding.id,
      name: holding.asset,
      symbol: holding.symbol,
      price: holding.price,
      change: holding.change,
      marketCap: holding.value * 100,
      volume: holding.value * 0.1,
      category: holding.symbol === 'GOLD' ? 'commodities' : 
                holding.symbol === 'REIT' ? 'real-estate' :
                holding.symbol === 'ART' ? 'art' :
                holding.symbol === 'BOND' ? 'bonds' : 'commodities',
      riskScore: holding.riskScore,
      hasProofOfReserve: true
    };
    onBridgeAsset(assetData);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
        <p className="text-slate-400">Track your RWA investments and performance</p>
      </motion.div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Portfolio Value', 
            value: `$${totalValue.toLocaleString()}`, 
            change: `+$${totalChange.toLocaleString()}`,
            changePercent: `+${totalChangePercent}%`,
            icon: DollarSign, 
            positive: true 
          },
          { 
            title: 'Total Assets', 
            value: portfolioData.length.toString(), 
            change: '+1',
            changePercent: '+25%',
            icon: PieChartIcon, 
            positive: true 
          },
          { 
            title: 'Average APY', 
            value: '10.3%', 
            change: '+0.8%',
            changePercent: '+8.4%',
            icon: TrendingUp, 
            positive: true 
          },
          { 
            title: 'Risk Score', 
            value: '4.2/10', 
            change: '-0.3',
            changePercent: '-6.7%',
            icon: Shield, 
            positive: true 
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
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
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
              <p className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change} today
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Portfolio Allocation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number, name: string) => [
                  `${value}% ($${portfolioData.find(p => p.name === name)?.amount.toLocaleString()})`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Portfolio Performance (6M)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-xl font-bold text-white mb-6">Your Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Asset</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Amount</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Value</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">24h Change</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">APY</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Risk</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <motion.tr
                  key={holding.symbol}
                  className="border-b border-slate-700/50 hover:bg-slate-700/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{holding.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{holding.asset}</p>
                        <p className="text-slate-400 text-sm">{holding.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-white">{holding.amount}</td>
                  <td className="py-4 px-4 text-right text-white">${holding.value.toLocaleString()}</td>
                  <td className={`py-4 px-4 text-right ${
                    holding.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-right text-green-400">{holding.apy}%</td>
                  <td className="py-4 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      holding.riskScore <= 3 ? 'bg-green-600/20 text-green-400' :
                      holding.riskScore <= 6 ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {holding.riskScore}/10
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleTradeAsset(holding)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Trade
                      </button>
                      <button 
                        onClick={() => handleBridgeAsset(holding)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>Bridge</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Portfolio;