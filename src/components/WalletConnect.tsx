import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Shield, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Copy,
  QrCode,
  Smartphone,
  Globe,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface WalletConnectProps {
  onBack?: () => void;
}

interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  isInstalled: boolean;
  isPopular?: boolean;
  downloadUrl?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onBack }) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const walletProviders: WalletProvider[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using browser extension',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask,
      isPopular: true,
      downloadUrl: 'https://metamask.io/download/'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Scan with WalletConnect to connect',
      isInstalled: true,
      isPopular: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect using Coinbase Wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isCoinbaseWallet,
      downloadUrl: 'https://www.coinbase.com/wallet'
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Connect using Trust Wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isTrust,
      downloadUrl: 'https://trustwallet.com/'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect using Phantom wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).solana?.isPhantom,
      downloadUrl: 'https://phantom.app/'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: '🌈',
      description: 'Connect using Rainbow wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isRainbow,
      downloadUrl: 'https://rainbow.me/'
    }
  ];

  const handleWalletConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      const mockAddress = '0x742d35Cc6634C0532925a3b8D4C2C4e0C8b83265';
      setWalletAddress(mockAddress);
      setConnectionStatus('success');
      
      // In a real implementation, you would:
      // 1. Request account access from the wallet
      // 2. Get the user's address
      // 3. Sign a message for authentication
      // 4. Send the signature to your backend for verification
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleBackToDashboard = () => {
    if (onBack) {
      onBack();
    }
  };

  if (connectionStatus === 'success' && walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Connected!</h2>
          <p className="text-slate-400 mb-6">Your wallet has been successfully connected to RWA Protocol</p>
          
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Connected Address</p>
                <p className="text-white font-mono">{formatAddress(walletAddress)}</p>
              </div>
              <button
                onClick={copyAddress}
                className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleBackToDashboard}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose your preferred wallet to start trading tokenized real-world assets
          </p>
        </motion.div>

        {/* Security Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            {
              icon: Shield,
              title: 'Secure Connection',
              description: 'Your private keys never leave your wallet'
            },
            {
              icon: Lock,
              title: 'Encrypted Data',
              description: 'All communications are end-to-end encrypted'
            },
            {
              icon: Zap,
              title: 'Instant Access',
              description: 'Connect once and access all features'
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-slate-800/30 backdrop-blur-xl border border-slate-700 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Wallet Options */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Choose Your Wallet</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walletProviders.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedWallet === wallet.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                } ${!wallet.isInstalled ? 'opacity-60' : ''}`}
                onClick={() => wallet.isInstalled && handleWalletConnect(wallet.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: wallet.isInstalled ? 1.02 : 1 }}
              >
                {wallet.isPopular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{wallet.name}</h3>
                    <p className="text-slate-400 text-sm">{wallet.description}</p>
                  </div>
                  
                  {wallet.isInstalled ? (
                    <div className="flex items-center space-x-2">
                      {isConnecting && selectedWallet === wallet.id ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Install</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* WalletConnect QR Code Option */}
          <motion.div
            className="mt-6 p-6 bg-slate-700/30 rounded-xl border border-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mobile Wallet</h3>
                  <p className="text-slate-400 text-sm">Scan QR code with your mobile wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
            </div>
            
            {showQR && (
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-slate-800 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">QR Code Placeholder</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-4">
                  Scan this QR code with your mobile wallet app
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Connection Status */}
          {connectionStatus === 'connecting' && (
            <motion.div
              className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-blue-400">Connecting to wallet...</span>
              </div>
            </motion.div>
          )}

          {connectionStatus === 'error' && (
            <motion.div
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Failed to connect wallet. Please try again.</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Need Help?</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>What is a wallet?</span>
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Security guide</span>
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <Smartphone className="w-4 h-4" />
              <span>Mobile setup</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletConnect;