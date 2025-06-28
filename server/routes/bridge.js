const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock bridge transactions storage
const bridgeTransactions = new Map();
let nextTxId = 1;

// Initiate cross-chain bridge
router.post('/initiate', auth, async (req, res) => {
  try {
    const {
      tokenAddress,
      amount,
      fromChain,
      toChain,
      recipientAddress
    } = req.body;
    
    // Validate input
    if (!tokenAddress || !amount || !fromChain || !toChain || !recipientAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (fromChain === toChain) {
      return res.status(400).json({ error: 'Cannot bridge to the same chain' });
    }
    
    // Calculate bridge fee (1%)
    const bridgeFee = amount * 0.01;
    const netAmount = amount - bridgeFee;
    
    // Create bridge transaction
    const bridgeTx = {
      id: nextTxId++,
      userId: req.userId,
      tokenAddress,
      amount,
      netAmount,
      bridgeFee,
      fromChain,
      toChain,
      recipientAddress,
      status: 'pending',
      createdAt: new Date(),
      estimatedTime: getEstimatedBridgeTime(fromChain, toChain),
      txHash: null,
      targetTxHash: null
    };
    
    bridgeTransactions.set(bridgeTx.id, bridgeTx);
    
    // Simulate bridge processing
    setTimeout(() => {
      processBridgeTransaction(bridgeTx.id);
    }, 5000); // 5 second delay
    
    res.status(201).json({
      message: 'Bridge transaction initiated',
      transaction: bridgeTx
    });
  } catch (error) {
    console.error('Initiate bridge error:', error);
    res.status(500).json({ error: 'Failed to initiate bridge transaction' });
  }
});

// Get bridge transaction status
router.get('/transaction/:txId', auth, async (req, res) => {
  try {
    const txId = parseInt(req.params.txId);
    const transaction = bridgeTransactions.get(txId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Check if user owns this transaction
    if (transaction.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Get bridge transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Get user's bridge history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const userTransactions = Array.from(bridgeTransactions.values())
      .filter(tx => tx.userId === req.userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      transactions: userTransactions,
      total: userTransactions.length
    });
  } catch (error) {
    console.error('Get bridge history error:', error);
    res.status(500).json({ error: 'Failed to fetch bridge history' });
  }
});

// Get supported chains
router.get('/chains', async (req, res) => {
  try {
    const supportedChains = [
      {
        id: 1,
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/...',
        blockExplorer: 'https://etherscan.io',
        gasPrice: '25 gwei',
        bridgeTime: '15-20 min'
      },
      {
        id: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com',
        gasPrice: '30 gwei',
        bridgeTime: '2-5 min'
      },
      {
        id: 42161,
        name: 'Arbitrum',
        symbol: 'ETH',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockExplorer: 'https://arbiscan.io',
        gasPrice: '0.1 gwei',
        bridgeTime: '2-5 min'
      },
      {
        id: 10,
        name: 'Optimism',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.optimism.io',
        blockExplorer: 'https://optimistic.etherscan.io',
        gasPrice: '0.001 gwei',
        bridgeTime: '2-5 min'
      }
    ];
    
    res.json(supportedChains);
  } catch (error) {
    console.error('Get supported chains error:', error);
    res.status(500).json({ error: 'Failed to fetch supported chains' });
  }
});

// Get bridge statistics
router.get('/stats', async (req, res) => {
  try {
    const allTransactions = Array.from(bridgeTransactions.values());
    
    const stats = {
      totalTransactions: allTransactions.length,
      totalVolume: allTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      successRate: allTransactions.length > 0 
        ? (allTransactions.filter(tx => tx.status === 'completed').length / allTransactions.length) * 100 
        : 0,
      avgBridgeTime: '5-10 minutes',
      popularRoutes: [
        { from: 'Ethereum', to: 'Polygon', count: 45 },
        { from: 'Polygon', to: 'Arbitrum', count: 32 },
        { from: 'Arbitrum', to: 'Ethereum', count: 28 }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get bridge stats error:', error);
    res.status(500).json({ error: 'Failed to fetch bridge statistics' });
  }
});

// Helper functions
function getEstimatedBridgeTime(fromChain, toChain) {
  if (fromChain === 1 || toChain === 1) { // Ethereum involved
    return '15-20 minutes';
  }
  return '2-5 minutes';
}

function processBridgeTransaction(txId) {
  const transaction = bridgeTransactions.get(txId);
  if (!transaction) return;
  
  // Simulate processing
  transaction.status = 'processing';
  transaction.txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  // Complete after another delay
  setTimeout(() => {
    transaction.status = 'completed';
    transaction.targetTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    transaction.completedAt = new Date();
    
    // In a real implementation, this would trigger a WebSocket notification
    console.log(`Bridge transaction ${txId} completed`);
  }, 10000); // 10 second delay
}

module.exports = router;