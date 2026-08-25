import express from 'express';
import orderController from '../controllers/orderController.js';
import { contractId } from '../config/stellar.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: process.env.STELLAR_NETWORK || 'testnet',
    contractId: contractId || 'not-configured',
    horizonUrl: process.env.HORIZON_URL
  });
});

// Order routes
router.get('/orders', orderController.getOrders);
router.get('/orders/:orderId', orderController.getOrderById);
router.post('/orders/build', orderController.buildCreateOrder);
router.get('/stats', orderController.getStats);

// Server-Sent Events para eventos en tiempo real
router.get('/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.write('data: {"message": "Connected to event stream"}\n\n');
  
  // Ping periódico para mantener conexión
  const pingInterval = setInterval(() => {
    res.write(`data: {"type": "ping", "timestamp": "${new Date().toISOString()}"}\n\n`);
  }, 30000);
  
  // Limpiar al cerrar
  req.on('close', () => {
    clearInterval(pingInterval);
    res.end();
  });
});

export default router;
