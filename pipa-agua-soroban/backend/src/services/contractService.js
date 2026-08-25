import * as StellarSdk from '@stellar/stellar-sdk';
import { server, networkPassphrase, contractId } from '../config/stellar.js';

/**
 * Servicio para interactuar con el smart contract de Soroban
 */
class ContractService {
  
  /**
   * Obtener información de una orden
   */
  async getOrder(orderId) {
    try {
      // En una implementación real, aquí llamarías al contrato
      // Por ahora retornamos estructura mock
      return {
        id: orderId,
        client: 'G...',
        driver: null,
        certifier: 'G...',
        amount: 10000000,
        liters: 5000,
        status: 'Pending',
        cert_hash: null,
        created_at: Date.now()
      };
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }
  
  /**
   * Obtener órdenes recientes
   */
  async getRecentOrders(limit = 10) {
    try {
      // Mock data
      return [
        {
          id: 1,
          client: 'GCLIENT...',
          driver: 'GDRIVER...',
          amount: 10000000,
          liters: 5000,
          status: 'Accepted',
          created_at: Date.now() - 3600000
        }
      ];
    } catch (error) {
      console.error('Error getting recent orders:', error);
      throw error;
    }
  }
  
  /**
   * Escuchar eventos del contrato en tiempo real
   */
  streamContractEvents(callback) {
    console.log('Starting event stream for contract:', contractId);
    
    // Stream de transacciones relacionadas con el contrato
    const eventSource = server
      .transactions()
      .cursor('now')
      .stream({
        onmessage: async (transaction) => {
          try {
            // Verificar si la transacción involucra nuestro contrato
            if (transaction.source_account === contractId || 
                transaction.account === contractId) {
              
              const event = {
                type: 'contract_event',
                txHash: transaction.id,
                timestamp: transaction.created_at,
                data: transaction
              };
              
              callback([event]);
            }
          } catch (err) {
            console.error('Error parsing transaction:', err);
          }
        },
        onerror: (error) => {
          console.error('Stream error:', error);
        }
      });
    
    return eventSource;
  }
  
  /**
   * Construir transacción para crear orden (para el frontend)
   */
  buildCreateOrderParams(certifierAddress, amount, liters) {
    return {
      function: 'create_order',
      parameters: {
        certifier: certifierAddress,
        amount: amount,
        liters: liters
      },
      contractId: contractId
    };
  }
}

export default new ContractService();
