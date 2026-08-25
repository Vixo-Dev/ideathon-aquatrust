import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import contractService from './services/contractService.js';
import { validateConfig, contractId } from './config/stellar.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Pipa de Agua API',
    version: '1.0.0',
    network: process.env.STELLAR_NETWORK || 'testnet',
    contractId: contractId || 'not-configured',
    endpoints: {
      health: '/api/health',
      orders: '/api/orders',
      stats: '/api/stats',
      events: '/api/events/stream'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚰 Pipa de Agua Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Network: ${process.env.STELLAR_NETWORK || 'testnet'}`);
  console.log(`🌐 Horizon: ${process.env.HORIZON_URL || 'default'}`);
  console.log(`📋 Contract: ${contractId || 'NOT CONFIGURED'}`);
  console.log('');
  
  // Validar configuración
  const configValidation = validateConfig();
  if (!configValidation.isValid) {
    console.log('⚠️  CONFIGURATION WARNINGS:');
    configValidation.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log('');
    console.log('💡 Update your .env file with the CONTRACT_ID from contracts/contract-id.txt');
    console.log('');
  } else {
    console.log('✅ Configuration valid');
    console.log('');
    
    // Iniciar stream de eventos del contrato
    console.log('🔊 Starting contract event stream...');
    try {
      contractService.streamContractEvents((events) => {
        console.log('📬 Contract events received:', events.length);
        events.forEach(event => {
          console.log('   ', event.type, '-', event.txHash.substring(0, 8));
        });
      });
    } catch (error) {
      console.error('Failed to start event stream:', error.message);
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📡 API available at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Orders: http://localhost:${PORT}/api/orders`);
  console.log('');
});

export default app;
