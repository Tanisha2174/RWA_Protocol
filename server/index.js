const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const WebSocket = require('ws');
const http = require('http');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rwa-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const tradingRoutes = require('./routes/trading');
const aiRoutes = require('./routes/ai');
const bridgeRoutes = require('./routes/bridge');
const analyticsRoutes = require('./routes/analytics');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bridge', bridgeRoutes);
app.use('/api/analytics', analyticsRoutes);

// Create HTTP server
const server = http.createServer(app);

// WebSocket server integrated with HTTP server with explicit path
const wss = new WebSocket.Server({ 
  server,
  path: '/websocket'
});

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast function for real-time updates
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Price update cron job (every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  try {
    const priceService = require('./services/priceService');
    const updatedPrices = await priceService.updateAllPrices();
    
    broadcast({
      type: 'PRICE_UPDATE',
      data: updatedPrices
    });
    
    console.log('Prices updated and broadcasted');
  } catch (error) {
    console.error('Error updating prices:', error);
  }
});

// AI analysis cron job (every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const aiService = require('./services/aiService');
    const analysis = await aiService.runMarketAnalysis();
    
    broadcast({
      type: 'AI_ANALYSIS',
      data: analysis
    });
    
    console.log('AI analysis completed and broadcasted');
  } catch (error) {
    console.error('Error running AI analysis:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server integrated with HTTP server on port ${PORT} at path /websocket`);
});

module.exports = { app, broadcast };