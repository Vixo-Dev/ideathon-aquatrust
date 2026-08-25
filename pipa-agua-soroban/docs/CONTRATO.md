# 📖 Documentación Técnica del Smart Contract

## Contrato: PipaEscrowContract

### Resumen

Smart contract en Rust/Soroban que implementa un sistema de escrow condicional para pedidos de pipas de agua. El contrato bloquea XLM del cliente y lo libera al chofer solo cuando se cumplen dos condiciones verificables: certificación de calidad del agua y confirmación de entrega del cliente.

---

## 🏗️ Arquitectura

### Estados de una Orden

```rust
pub enum OrderStatus {
    Pending,      // Orden creada, esperando chofer
    Accepted,     // Chofer asignado
    Certified,    // Agua certificada
    Delivered,    // Chofer marcó entrega
    Paid,         // Pago liberado al chofer
    Disputed,     // En disputa
    Refunded,     // Reembolsado al cliente
}
```

### Estructura de Datos

```rust
pub struct Order {
    pub id: u64,                          // ID único de la orden
    pub client: Address,                  // Address del cliente
    pub driver: Option<Address>,          // Address del chofer (opcional)
    pub certifier: Address,               // Address del certificador autorizado
    pub amount: i128,                     // Monto en stroops (1 XLM = 10^7)
    pub liters: u32,                      // Litros solicitados
    pub status: OrderStatus,              // Estado actual
    pub cert_hash: Option<BytesN<32>>,    // Hash del certificado
    pub cert_timestamp: Option<u64>,      // Timestamp de certificación
    pub created_at: u64,                  // Timestamp de creación
    pub delivered_at: Option<u64>,        // Timestamp de entrega
}
```

---

## 🔧 Funciones Públicas

### Inicialización

#### `initialize(admin: Address)`

Inicializa el contrato con un administrador. Solo se puede llamar una vez.

**Parámetros:**
- `admin`: Address que tendrá permisos de administrador

**Requiere:** Autenticación del admin

**Emite:** Evento `initialized`

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin GADMIN...
```

---

### Cliente

#### `create_order(client: Address, certifier: Address, amount: i128, liters: u32) -> u64`

Cliente crea una nueva orden y deposita XLM en escrow.

**Parámetros:**
- `client`: Address del cliente (debe coincidir con quien firma)
- `certifier`: Address de la entidad certificadora autorizada
- `amount`: Monto en stroops (1 XLM = 10,000,000 stroops)
- `liters`: Cantidad de litros solicitados

**Returns:** ID de la orden creada

**Requiere:** Autenticación del client

**Validaciones:**
- `amount` debe ser > 0
- `liters` debe ser > 0

**Estado:** PENDING

**Emite:** Evento `order_created(order_id, client, amount, liters)`

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source cliente \
  --network testnet \
  -- \
  create_order \
  --client GCLIENT... \
  --certifier GCERT... \
  --amount 10000000 \
  --liters 5000
```

#### `confirm_delivery(order_id: u64, client: Address)`

Cliente confirma que recibió el agua. Esta función verifica las condiciones y libera el pago automáticamente.

**Parámetros:**
- `order_id`: ID de la orden
- `client`: Address del cliente (debe coincidir)

**Requiere:** Autenticación del client

**Validaciones:**
- Client debe coincidir con el de la orden
- Debe existir certificado válido (`cert_hash` no null)
- Estado debe ser Accepted o Certified

**Estado:** DELIVERED → PAID (automático)

**Emite:** 
- `delivery_confirmed(order_id, client)`
- `payment_released(order_id, driver, amount)`

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source cliente \
  --network testnet \
  -- \
  confirm_delivery \
  --order_id 1 \
  --client GCLIENT...
```

---

### Chofer

#### `accept_order(order_id: u64, driver: Address)`

Chofer acepta una orden disponible.

**Parámetros:**
- `order_id`: ID de la orden
- `driver`: Address del chofer

**Requiere:** Autenticación del driver

**Validaciones:**
- Estado debe ser PENDING

**Estado:** PENDING → ACCEPTED

**Emite:** Evento `order_accepted(order_id, driver)`

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source chofer \
  --network testnet \
  -- \
  accept_order \
  --order_id 1 \
  --driver GDRIVER...
```

---

### Certificador

#### `submit_cert(order_id: u64, certifier: Address, cert_hash: BytesN<32>)`

Certificador registra el hash del certificado de calidad del agua.

**Parámetros:**
- `order_id`: ID de la orden
- `certifier`: Address del certificador (debe coincidir)
- `cert_hash`: Hash SHA-256 del certificado (32 bytes)

**Requiere:** Autenticación del certifier

**Validaciones:**
- Certifier debe coincidir con el autorizado en la orden
- Estado no debe ser PAID o REFUNDED

**Estado:** → CERTIFIED

**Emite:** Evento `cert_submitted(order_id, certifier, cert_hash)`

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source certificador \
  --network testnet \
  -- \
  submit_cert \
  --order_id 1 \
  --certifier GCERT... \
  --cert_hash 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

---

### Sistema de Disputas

#### `dispute_order(order_id: u64, caller: Address)`

Cliente o chofer inician una disputa.

**Parámetros:**
- `order_id`: ID de la orden
- `caller`: Address de quien disputa (client o driver)

**Requiere:** Autenticación del caller

**Validaciones:**
- Caller debe ser el cliente o el chofer de la orden
- Estado no debe ser PAID o REFUNDED

**Estado:** → DISPUTED

**Emite:** Evento `order_disputed(order_id, caller)`

#### `resolve_dispute_to_driver(order_id: u64)`

Admin resuelve disputa liberando pago al chofer.

**Requiere:** Autenticación del admin

**Validaciones:**
- Estado debe ser DISPUTED

**Estado:** DISPUTED → PAID

**Emite:** Evento `dispute_resolved(order_id, driver, "DRIVER")`

#### `resolve_dispute_to_client(order_id: u64)`

Admin resuelve disputa reembolsando al cliente.

**Requiere:** Autenticación del admin

**Validaciones:**
- Estado debe ser DISPUTED

**Estado:** DISPUTED → REFUNDED

**Emite:** Evento `dispute_resolved(order_id, client, "CLIENT")`

---

### Consultas (Read-Only)

#### `get_order(order_id: u64) -> Order`

Obtiene información completa de una orden.

**Parámetros:**
- `order_id`: ID de la orden

**Returns:** Estructura `Order` completa

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  get_order \
  --order_id 1
```

#### `get_recent_orders(limit: u32) -> Vec<Order>`

Obtiene las últimas N órdenes.

**Parámetros:**
- `limit`: Número máximo de órdenes a retornar

**Returns:** Vector de órdenes

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  get_recent_orders \
  --limit 10
```

#### `get_order_count() -> u64`

Obtiene el total de órdenes creadas.

**Returns:** Número total de órdenes

**Ejemplo:**
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  get_order_count
```

---

## 🔐 Condiciones de Liberación de Pago

El pago se libera **ÚNICAMENTE** cuando se cumplen **AMBAS** condiciones simultáneamente:

### Condición A: Certificado Válido
```rust
if order.cert_hash.is_none() {
    panic!("Missing certification");
}
```
- Debe existir un `cert_hash`
- Debe haber sido registrado por el certificador autorizado
- Timestamp debe ser posterior a la creación de la orden

### Condición B: Confirmación del Cliente
```rust
client.require_auth();
if order.client != client {
    panic!("Unauthorized client");
}
```
- Cliente debe firmar la transacción `confirm_delivery()`
- Firma debe provenir de la misma address que creó la orden
- Estado debe ser válido (Accepted o Certified)

### Liberación Automática
```rust
fn release_payment_internal(env: Env, order_id: u64) {
    // Verifica condiciones
    // Transfiere XLM al chofer
    // Marca como PAID
}
```

Llamada automáticamente desde `confirm_delivery()`.

---

## 📊 Flujo de Estados

```
┌──────────┐
│ PENDING  │ ← Cliente crea orden
└────┬─────┘
     │
     │ accept_order()
     ↓
┌──────────┐
│ ACCEPTED │
└────┬─────┘
     │
     │ submit_cert()
     ↓
┌───────────┐
│ CERTIFIED │
└─────┬─────┘
      │
      │ confirm_delivery()
      ↓
┌───────────┐     Verificación:
│ DELIVERED │  →  ✓ Cert exists
└─────┬─────┘     ✓ Client confirms
      │
      │ release_payment_internal()
      ↓
┌──────────┐
│   PAID   │ ← Pago liberado al chofer
└──────────┘
```

Flujo alternativo (disputa):
```
Any State → dispute_order() → DISPUTED
                                  │
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
           resolve_to_driver()        resolve_to_client()
                    │                           │
                    ↓                           ↓
                  PAID                      REFUNDED
```

---

## 🧪 Tests

El contrato incluye tests unitarios completos:

```bash
cd contracts/pipa-escrow
cargo test
```

### Tests Incluidos:

1. **test_create_order**: Verifica creación básica de órdenes
2. **test_accept_order**: Verifica asignación de chofer
3. **test_full_flow**: Prueba el flujo completo end-to-end
4. **test_confirm_without_cert**: Verifica que falla sin certificado

---

## 🔍 Eventos Emitidos

| Evento | Parámetros | Descripción |
|--------|-----------|-------------|
| `initialized` | `admin` | Contrato inicializado |
| `order_created` | `order_id, client, amount, liters` | Nueva orden creada |
| `order_accepted` | `order_id, driver` | Chofer aceptó orden |
| `cert_submitted` | `order_id, certifier, cert_hash` | Certificado registrado |
| `delivery_confirmed` | `order_id, client` | Cliente confirmó entrega |
| `payment_released` | `order_id, driver, amount` | Pago liberado |
| `order_disputed` | `order_id, caller` | Disputa iniciada |
| `dispute_resolved` | `order_id, winner, type` | Disputa resuelta |

---

## 💾 Almacenamiento

El contrato usa `instance storage` de Soroban para persistir:

```rust
pub enum StorageKey {
    Order(u64),      // Orden por ID
    OrderCount,       // Contador de órdenes
    Admin,            // Address del admin
}
```

Todas las órdenes quedan permanentemente en el ledger y son auditables públicamente.

---

## ⚠️ Consideraciones de Seguridad

1. **Fondos Bloqueados**: XLM queda en el contrato, no en cuenta de empresa
2. **Autorización Requerida**: Todas las funciones críticas requieren `require_auth()`
3. **Validación de Certificador**: Solo el certificador autorizado puede certificar
4. **Inmutabilidad**: Reglas del contrato no pueden cambiar post-deployment
5. **Auditoría Pública**: Todo queda en el ledger público de Stellar

---

## 🚀 Deployment

Ver [GUIA_INSTALACION.md](../GUIA_INSTALACION.md) para instrucciones completas de deployment.

Comandos rápidos:
```bash
cd contracts
./build.sh      # Compila a WASM
./deploy.sh     # Despliega a testnet
```

---

## 📚 Referencias

- [Soroban SDK Docs](https://docs.rs/soroban-sdk/)
- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Examples](https://github.com/stellar/soroban-examples)
