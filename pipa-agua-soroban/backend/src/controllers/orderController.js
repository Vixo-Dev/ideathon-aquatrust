import contractService from '../services/contractService.js';

/**
 * Obtener todas las órdenes recientes
 */
export async function getOrders(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const orders = await contractService.getRecentOrders(limit);
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
}

/**
 * Obtener una orden específica
 */
export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const order = await contractService.getOrder(parseInt(orderId));
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
}

/**
 * Obtener parámetros para crear orden
 * El frontend usa esto para construir la transacción
 */
export async function buildCreateOrder(req, res) {
  try {
    const { certifierAddress, amount, liters } = req.body;
    
    if (!certifierAddress || !amount || !liters) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: certifierAddress, amount, liters'
      });
    }
    
    const params = contractService.buildCreateOrderParams(
      certifierAddress,
      amount,
      liters
    );
    
    res.json({
      success: true,
      message: 'Build this transaction on the client side with your wallet',
      data: params
    });
  } catch (error) {
    console.error('Error building order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to build order parameters'
    });
  }
}

/**
 * Obtener estadísticas generales
 */
export async function getStats(req, res) {
  try {
    // Mock stats
    const stats = {
      totalOrders: 42,
      activeOrders: 5,
      completedOrders: 35,
      totalLitersDelivered: 210000,
      totalValueXLM: 420000000
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
}

export default {
  getOrders,
  getOrderById,
  buildCreateOrder,
  getStats
};
