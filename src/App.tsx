import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import TradingInterface from './components/TradingInterface';
import AIAnalytics from './components/AIAnalytics';
import CrossChainBridge from './components/CrossChainBridge';
import Portfolio from './components/Portfolio';
import WalletConnect from './components/WalletConnect';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const handleSelectAsset = (asset: any) => {
    setSelectedAsset(asset);
    setActiveTab('trading');
  };

  const handleBridgeAsset = (asset: any) => {
    setSelectedAsset(asset);
    setActiveTab('bridge');
  };

  const renderContent = () => {
    if (showWalletConnect) {
      return <WalletConnect onBack={() => setShowWalletConnect(false)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onSelectAsset={handleSelectAsset} />;
      case 'assets':
        return <AssetList onSelectAsset={handleSelectAsset} onBridgeAsset={handleBridgeAsset} />;
      case 'trading':
        return <TradingInterface selectedAsset={selectedAsset} />;
      case 'ai-analytics':
        return <AIAnalytics />;
      case 'bridge':
        return <CrossChainBridge selectedAsset={selectedAsset} />;
      case 'portfolio':
        return <Portfolio onSelectAsset={handleSelectAsset} onBridgeAsset={handleBridgeAsset} />;
      default:
        return <Dashboard onSelectAsset={handleSelectAsset} />;
    }
  };

  if (showWalletConnect) {
    return <WalletConnect onBack={() => setShowWalletConnect(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onConnectWallet={() => setShowWalletConnect(true)}
      />
      
      <main className="container mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}

export default App;