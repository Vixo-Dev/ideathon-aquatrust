import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

const isTestnet = process.env.STELLAR_NETWORK === 'testnet';

export const server = new StellarSdk.Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

export const networkPassphrase = isTestnet 
  ? StellarSdk.Networks.TESTNET 
  : StellarSdk.Networks.PUBLIC;

export const contractId = process.env.CONTRACT_ID;

// Helper para crear keypair desde secret
export function getKeyPairFromSecret(secret) {
  return StellarSdk.Keypair.fromSecret(secret);
}

// Helper para obtener account
export async function loadAccount(publicKey) {
  return await server.loadAccount(publicKey);
}

// Verificar configuración
export function validateConfig() {
  const issues = [];
  
  if (!contractId || contractId === 'your-contract-id-here') {
    issues.push('CONTRACT_ID not configured in .env');
  }
  
  if (!process.env.HORIZON_URL) {
    issues.push('HORIZON_URL not configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export default {
  server,
  networkPassphrase,
  contractId,
  getKeyPairFromSecret,
  loadAccount,
  validateConfig
};
