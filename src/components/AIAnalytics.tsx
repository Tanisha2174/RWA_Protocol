import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Target,
  BarChart3,
  Zap,
  PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AIAnalytics: React.FC = () => {
  const predictionData = [
    { asset: 'Gold Token', current: 2456, predicted: 2534, confidence: 94 },
    { asset: 'Real Estate REIT', current: 1234, predicted: 1287, confidence: 87 },
    { asset: 'Art Collection', current: 3456, predicted: 3234, confidence: 76 },
    { asset: 'Treasury Bonds', current: 987, predicted: 1023, confidence: 92 },
    { asset: 'Commodity ETF', current: 1876, predicted: 1943, confidence: 89 },
  ];

  const riskData = [
    { name: 'Low Risk', value: 35, color: '#10B981' },
    { name: 'Medium Risk', value: 45, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' },
  ];

  const performanceData = [
    { month: 'Jan', accuracy: 92 },
    { month: 'Feb', accuracy: 89 },
    { month: 'Mar', accuracy: 94 },
    { month: 'Apr', accuracy: 87 },
    { month: 'May', accuracy: 91 },
    { month: 'Jun', accuracy: 95 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">AI Analytics Dashboard</h1>
        <p className="text-slate-400">Advanced machine learning insights for RWA trading</p>
      </motion.div>

      {/* AI Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Prediction Accuracy', value: '94.3%', change: '+2.1%', icon: Target, color: 'green' },
          { title: 'Risk Detection', value: '97.8%', change: '+1.4%', icon: Shield, color: 'blue' },
          { title: 'Market Signals', value: '156', change: '+23', icon: TrendingUp, color: 'purple' },
          { title: 'AI Confidence', value: '89.2%', change: '+0.8%', icon: Brain, color: 'orange' },
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
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  stat.color === 'green' ? 'from-green-500 to-emerald-600' :
                  stat.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                  stat.color === 'purple' ? 'from-purple-500 to-violet-600' :
                  'from-orange-500 to-amber-600'
                } rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-sm">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Predictions */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Price Predictions</h2>
          </div>
          
          <div className="space-y-4">
            {predictionData.map((item, index) => (
              <motion.div
                key={item.asset}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex-1">
                  <h3 className="text-white font-medium">{item.asset}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-slate-400 text-sm">Current: ${item.current}</span>
                    <span className="text-blue-400 text-sm">Predicted: ${item.predicted}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    item.predicted > item.current ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {((item.predicted - item.current) / item.current * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.confidence}% confidence
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Risk Analysis */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Risk Distribution</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
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
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center space-x-6 mt-4">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-400 text-sm">{item.name}</span>
                <span className="text-white text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Model Performance */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Model Performance Over Time</h2>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} domain={[80, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value) => [`${value}%`, 'Accuracy']}
            />
            <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Alerts */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Recent AI Alerts</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { type: 'opportunity', message: 'Strong buy signal detected for Gold Token', time: '5 minutes ago', icon: TrendingUp },
            { type: 'warning', message: 'High volatility expected for Real Estate REIT', time: '15 minutes ago', icon: AlertTriangle },
            { type: 'info', message: 'New market correlation pattern identified', time: '1 hour ago', icon: Brain },
            { type: 'success', message: 'Portfolio rebalancing recommendation generated', time: '2 hours ago', icon: PieChart },
          ].map((alert, index) => {
            const Icon = alert.icon;
            return (
              <motion.div
                key={index}
                className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  alert.type === 'opportunity' ? 'bg-green-600' :
                  alert.type === 'warning' ? 'bg-yellow-600' :
                  alert.type === 'info' ? 'bg-blue-600' :
                  'bg-purple-600'
                }`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{alert.message}</p>
                  <p className="text-slate-400 text-sm mt-1">{alert.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default AIAnalytics;