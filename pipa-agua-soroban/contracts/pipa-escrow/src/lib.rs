#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Symbol, Vec};

// Estados posibles de una orden
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum OrderStatus {
    Pending,      // Orden creada, esperando chofer
    Accepted,     // Chofer asignado
    Certified,    // Agua certificada
    Delivered,    // Chofer marcó entrega
    Paid,         // Pago liberado al chofer
    Disputed,     // En disputa
    Refunded,     // Reembolsado al cliente
}

// Estructura completa de una orden
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Order {
    pub id: u64,
    pub client: Address,
    pub driver: Option<Address>,
    pub certifier: Address,
    pub amount: i128,           // XLM en stroops (1 XLM = 10^7 stroops)
    pub liters: u32,
    pub status: OrderStatus,
    pub cert_hash: Option<BytesN<32>>,
    pub cert_timestamp: Option<u64>,
    pub created_at: u64,
    pub delivered_at: Option<u64>,
}

// Claves de almacenamiento
#[contracttype]
pub enum StorageKey {
    Order(u64),        // Orden por ID
    OrderCount,         // Contador total de órdenes
    Admin,              // Address del administrador del contrato
}

#[contract]
pub struct PipaEscrowContract;

#[contractimpl]
impl PipaEscrowContract {
    
    /// Inicializa el contrato con un administrador
    /// Solo se puede llamar una vez
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        
        if env.storage().instance().has(&StorageKey::Admin) {
            panic!("Contract already initialized");
        }
        
        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::OrderCount, &0u64);
        
        env.events().publish(
            (Symbol::new(&env, "initialized"),),
            admin
        );
    }
    
    /// Cliente crea una nueva orden y deposita XLM en escrow
    /// 
    /// # Parámetros
    /// - client: Address del cliente que paga
    /// - certifier: Address de la entidad certificadora autorizada
    /// - amount: Cantidad de XLM en stroops (1 XLM = 10,000,000 stroops)
    /// - liters: Litros de agua solicitados
    /// 
    /// # Returns
    /// ID de la orden creada
    pub fn create_order(
        env: Env,
        client: Address,
        certifier: Address,
        amount: i128,
        liters: u32,
    ) -> u64 {
        client.require_auth();
        
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        if liters == 0 {
            panic!("Liters must be greater than zero");
        }
        
        // Obtener el siguiente ID de orden
        let mut order_count: u64 = env.storage()
            .instance()
            .get(&StorageKey::OrderCount)
            .unwrap_or(0);
        
        order_count += 1;
        
        // Crear la orden
        let order = Order {
            id: order_count,
            client: client.clone(),
            driver: None,
            certifier,
            amount,
            liters,
            status: OrderStatus::Pending,
            cert_hash: None,
            cert_timestamp: None,
            created_at: env.ledger().timestamp(),
            delivered_at: None,
        };
        
        // Guardar orden y actualizar contador
        env.storage().instance().set(&StorageKey::Order(order_count), &order);
        env.storage().instance().set(&StorageKey::OrderCount, &order_count);
        
        // Emitir evento
        env.events().publish(
            (Symbol::new(&env, "order_created"),),
            (order_count, client, amount, liters)
        );
        
        order_count
    }
    
    /// Chofer acepta una orden disponible
    pub fn accept_order(env: Env, order_id: u64, driver: Address) {
        driver.require_auth();
        
        let mut order: Order = Self::get_order(&env, order_id);
        
        if order.status != OrderStatus::Pending {
            panic!("Order is not in PENDING status");
        }
        
        order.driver = Some(driver.clone());
        order.status = OrderStatus::Accepted;
        
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "order_accepted"),),
            (order_id, driver)
        );
    }
    
    /// Certificador registra el hash del certificado de calidad del agua
    /// Solo puede ser llamado por el certificador autorizado en la orden
    pub fn submit_cert(
        env: Env,
        order_id: u64,
        certifier: Address,
        cert_hash: BytesN<32>,
    ) {
        certifier.require_auth();
        
        let mut order: Order = Self::get_order(&env, order_id);
        
        // Verificar que el certificador es el autorizado
        if order.certifier != certifier {
            panic!("Unauthorized certifier");
        }
        
        if order.status == OrderStatus::Paid || order.status == OrderStatus::Refunded {
            panic!("Order already finalized");
        }
        
        order.cert_hash = Some(cert_hash.clone());
        order.cert_timestamp = Some(env.ledger().timestamp());
        order.status = OrderStatus::Certified;
        
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "cert_submitted"),),
            (order_id, certifier, cert_hash)
        );
    }
    
    /// Cliente confirma que recibió el agua
    /// Esta función verifica ambas condiciones y libera el pago automáticamente
    pub fn confirm_delivery(env: Env, order_id: u64, client: Address) {
        client.require_auth();
        
        let mut order: Order = Self::get_order(&env, order_id);
        
        // Verificar que es el cliente correcto
        if order.client != client {
            panic!("Unauthorized client");
        }
        
        // CONDICIÓN 1: Verificar que el certificado está registrado
        if order.cert_hash.is_none() {
            panic!("Water quality not certified yet");
        }
        
        // Verificar estado válido
        if order.status != OrderStatus::Accepted && order.status != OrderStatus::Certified {
            panic!("Invalid order status for delivery confirmation");
        }
        
        order.status = OrderStatus::Delivered;
        order.delivered_at = Some(env.ledger().timestamp());
        
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "delivery_confirmed"),),
            (order_id, client)
        );
        
        // Liberar pago automáticamente
        Self::release_payment_internal(env, order_id);
    }
    
    /// Función interna: Libera el pago al chofer
    /// Solo se ejecuta cuando AMBAS condiciones se cumplen:
    /// 1. Certificado válido registrado
    /// 2. Cliente confirmó entrega
    fn release_payment_internal(env: Env, order_id: u64) {
        let mut order: Order = Self::get_order(&env, order_id);
        
        if order.status != OrderStatus::Delivered {
            panic!("Order not delivered");
        }
        
        let driver = order.driver.as_ref()
            .expect("No driver assigned");
        
        // VERIFICACIÓN FINAL: Ambas condiciones
        if order.cert_hash.is_none() {
            panic!("Missing certification");
        }
        
        // En una implementación completa, aquí transferirías XLM usando soroban-token-sdk:
        // token_client.transfer(&env.current_contract_address(), driver, &order.amount);
        
        order.status = OrderStatus::Paid;
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "payment_released"),),
            (order_id, driver.clone(), order.amount)
        );
    }
    
    /// Iniciar proceso de disputa
    /// Puede ser llamado por el cliente o el chofer
    pub fn dispute_order(env: Env, order_id: u64, caller: Address) {
        caller.require_auth();
        
        let mut order: Order = Self::get_order(&env, order_id);
        
        // Solo cliente o chofer pueden disputar
        let is_client = order.client == caller;
        let is_driver = order.driver.as_ref().map_or(false, |d| d == &caller);
        
        if !is_client && !is_driver {
            panic!("Only client or driver can dispute");
        }
        
        if order.status == OrderStatus::Paid || order.status == OrderStatus::Refunded {
            panic!("Order already finalized");
        }
        
        order.status = OrderStatus::Disputed;
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "order_disputed"),),
            (order_id, caller)
        );
    }
    
    /// Admin resuelve disputa a favor del chofer
    pub fn resolve_dispute_to_driver(env: Env, order_id: u64) {
        let admin: Address = env.storage()
            .instance()
            .get(&StorageKey::Admin)
            .expect("Contract not initialized");
        
        admin.require_auth();
        
        let mut order: Order = Self::get_order(&env, order_id);
        
        if order.status != OrderStatus::Disputed {
            panic!("Order is not disputed");
        }
        
        let driver = order.driver.as_ref()
            .expect("No driver assigned");
        
        order.status = OrderStatus::Paid;
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "dispute_resolved"),),
            (order_id, driver.clone(), String::from_str(&env, "DRIVER"))
        );
    }
    
    /// Admin resuelve disputa a favor del cliente (reembolso)
    pub fn resolve_dispute_to_client(env: Env, order_id: u64) {
        let admin: Address = env.storage()
            .instance()
            .get(&StorageKey::Admin)
            .expect("Contract not initialized");
        
        admin.require_auth();
        
        let mut order: Order = Self::get_order(&env, order_id);
        
        if order.status != OrderStatus::Disputed {
            panic!("Order is not disputed");
        }
        
        order.status = OrderStatus::Refunded;
        env.storage().instance().set(&StorageKey::Order(order_id), &order);
        
        env.events().publish(
            (Symbol::new(&env, "dispute_resolved"),),
            (order_id, order.client.clone(), String::from_str(&env, "CLIENT"))
        );
    }
    
    /// Obtener información completa de una orden
    pub fn get_order(env: &Env, order_id: u64) -> Order {
        env.storage()
            .instance()
            .get(&StorageKey::Order(order_id))
            .expect("Order not found")
    }
    
    /// Obtener las últimas N órdenes
    pub fn get_recent_orders(env: Env, limit: u32) -> Vec<Order> {
        let order_count: u64 = env.storage()
            .instance()
            .get(&StorageKey::OrderCount)
            .unwrap_or(0);
        
        let mut orders = Vec::new(&env);
        let start = if order_count > limit as u64 {
            order_count - limit as u64 + 1
        } else {
            1
        };
        
        for id in start..=order_count {
            if let Some(order) = env.storage().instance().get(&StorageKey::Order(id)) {
                orders.push_back(order);
            }
        }
        
        orders
    }
    
    /// Obtener el total de órdenes creadas
    pub fn get_order_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&StorageKey::OrderCount)
            .unwrap_or(0)
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_order() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PipaEscrowContract);
        let client = PipaEscrowContract::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let certifier = Address::generate(&env);

        env.mock_all_auths();

        // Inicializar
        client.initialize(&admin);

        // Crear orden
        let order_id = client.create_order(&user, &certifier, &10_000_000, &5000);
        
        assert_eq!(order_id, 1);
        
        let order = client.get_order(&order_id);
        assert_eq!(order.client, user);
        assert_eq!(order.amount, 10_000_000);
        assert_eq!(order.liters, 5000);
        assert_eq!(order.status, OrderStatus::Pending);
    }

    #[test]
    fn test_accept_order() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PipaEscrowContract);
        let client = PipaEscrowContract::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let driver = Address::generate(&env);
        let certifier = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin);
        let order_id = client.create_order(&user, &certifier, &10_000_000, &5000);
        
        client.accept_order(&order_id, &driver);
        
        let order = client.get_order(&order_id);
        assert_eq!(order.driver, Some(driver.clone()));
        assert_eq!(order.status, OrderStatus::Accepted);
    }

    #[test]
    fn test_full_flow() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PipaEscrowContract);
        let client = PipaEscrowContract::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let driver = Address::generate(&env);
        let certifier = Address::generate(&env);

        env.mock_all_auths();

        // 1. Inicializar
        client.initialize(&admin);

        // 2. Cliente crea orden
        let order_id = client.create_order(&user, &certifier, &10_000_000, &5000);

        // 3. Chofer acepta
        client.accept_order(&order_id, &driver);

        // 4. Certificador valida agua
        let cert_hash = BytesN::from_array(&env, &[1u8; 32]);
        client.submit_cert(&order_id, &certifier, &cert_hash);

        // 5. Cliente confirma entrega (libera pago automático)
        client.confirm_delivery(&order_id, &user);

        // Verificar estado final
        let order = client.get_order(&order_id);
        assert_eq!(order.status, OrderStatus::Paid);
        assert!(order.cert_hash.is_some());
        assert!(order.delivered_at.is_some());
    }

    #[test]
    #[should_panic(expected = "Water quality not certified yet")]
    fn test_confirm_without_cert() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PipaEscrowContract);
        let client = PipaEscrowContract::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let driver = Address::generate(&env);
        let certifier = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin);
        let order_id = client.create_order(&user, &certifier, &10_000_000, &5000);
        client.accept_order(&order_id, &driver);
        
        // Intentar confirmar SIN certificado -> debe fallar
        client.confirm_delivery(&order_id, &user);
    }
}
