# 🚰 Sistema de Pipas de Agua - Soroban/Stellar

Sistema descentralizado de gestión de pedidos de pipas de agua usando smart contracts en Soroban (Stellar). Resuelve el problema de confianza entre clientes y choferes mediante escrow condicional con certificación de calidad del agua.

## 🎯 Problema que Resuelve

- **Cliente**: No tiene garantía de recibir agua limpia ni los litros acordados
- **Chofer**: No tiene garantía de cobro después de entregar el servicio
- **Solución**: Smart contract que bloquea el pago y lo libera solo cuando se cumplen DOS condiciones:
  1. Certificador autorizado valida la calidad del agua
  2. Cliente confirma recepción con firma criptográfica

## 🏗️ Arquitectura del Proyecto

```
pipa-agua-soroban/
├── contracts/          # Smart contracts en Rust (Soroban)
│   └── pipa-escrow/   # Contrato principal de escrow
├── backend/           # API REST en Node.js + Express
├── frontend/          # App móvil en React Native + Expo
└── docs/              # Documentación técnica
```

## 🔧 Stack Tecnológico

- **Blockchain**: Stellar Testnet / Soroban
- **Smart Contracts**: Rust + soroban-sdk 21.0.0
- **Backend**: Node.js 18+ + Express + @stellar/stellar-sdk
- **Frontend**: React Native + Expo
- **Token**: XLM (Lumens nativos de Stellar)

## 🚀 Instalación y Setup

### Prerequisitos

Asegúrate de tener instalado:

```bash
# Rust (para compilar contratos)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Node.js 18+
node --version  # debe ser >= 18

# Soroban CLI
cargo install --locked soroban-cli --features opt

# Stellar CLI (opcional)
cargo install --locked stellar-cli
```

### Setup Completo (5 minutos)

```bash
# 1. Clonar el repositorio
git clone <tu-repo-url>
cd pipa-agua-soroban

# 2. Configurar red Stellar Testnet
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# 3. Crear identidades de prueba
soroban keys generate admin --network testnet
soroban keys generate cliente --network testnet
soroban keys generate chofer --network testnet
soroban keys generate certificador --network testnet

# 4. Fondear cuentas con XLM de prueba (Friendbot)
curl "https://friendbot.stellar.org?addr=$(soroban keys address admin)"
curl "https://friendbot.stellar.org?addr=$(soroban keys address cliente)"
curl "https://friendbot.stellar.org?addr=$(soroban keys address chofer)"
curl "https://friendbot.stellar.org?addr=$(soroban keys address certificador)"

# 5. Compilar y desplegar el contrato
cd contracts
chmod +x *.sh
./build.sh
./deploy.sh
cd ..

# Esto generará un CONTRACT_ID en contracts/.env
# Copia ese CONTRACT_ID para los siguientes pasos

# 6. Configurar backend
cd backend
npm install
cp .env.example .env
# Edita .env y agrega el CONTRACT_ID
nano .env

# 7. Iniciar backend
npm run dev
# Backend corriendo en http://localhost:3000

# 8. En otra terminal, configurar frontend
cd frontend
npm install
cp .env.example .env
# Edita .env y agrega el CONTRACT_ID
nano .env

# 9. Iniciar app móvil
npx expo start
# Escanea el QR con Expo Go en tu teléfono
```

## 📋 Flujo de Negocio

```
┌─────────────┐
│   CLIENTE   │
└──────┬──────┘
       │ 1. create_order(certifier, amount, liters)
       │    → XLM bloqueado en contrato
       ↓
┌─────────────────┐
│ SMART CONTRACT  │ Estado: PENDING
└─────────────────┘
       │
       │ 2. Chofer ve pedido disponible
       ↓
┌─────────────┐
│   CHOFER    │
└──────┬──────┘
       │ 3. accept_order(order_id)
       │    → Estado: ACCEPTED
       ↓
┌──────────────────┐
│  CERTIFICADOR    │
└────────┬─────────┘
         │ 4. submit_cert(order_id, cert_hash)
         │    → Estado: CERTIFIED
         ↓
┌─────────────┐
│   CHOFER    │ 5. Entrega física + Genera QR
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   CLIENTE   │ 6. Escanea QR → Firma transacción
└──────┬──────┘    confirm_delivery()
       │
       ↓
┌─────────────────┐
│ SMART CONTRACT  │ 7. Verifica condiciones:
└─────────────────┘    ✓ Certificado válido
       │               ✓ Cliente confirmó
       │    → Libera XLM al chofer
       ↓               Estado: PAID
   [ÉXITO]
```

## 🔐 Funciones del Smart Contract

### Cliente
- `create_order(certifier, amount, liters)` - Crear orden y bloquear XLM
- `confirm_delivery(order_id)` - Confirmar recepción del agua
- `dispute_order(order_id)` - Iniciar disputa si hay problemas

### Chofer
- `accept_order(order_id)` - Aceptar un pedido disponible
- `dispute_order(order_id)` - Iniciar disputa

### Certificador
- `submit_cert(order_id, cert_hash)` - Registrar certificado de calidad

### Admin
- `resolve_dispute_to_driver(order_id)` - Resolver disputa a favor del chofer
- `resolve_dispute_to_client(order_id)` - Resolver disputa reembolsando cliente

### Lectura
- `get_order(order_id)` - Obtener detalles de una orden
- `get_recent_orders(limit)` - Listar órdenes recientes
- `get_order_count()` - Total de órdenes creadas

## 🧪 Testing

```bash
# Test del smart contract
cd contracts/pipa-escrow
cargo test

# Verificar que pasen todos los tests:
# ✓ test_create_order
# ✓ test_accept_order
# ✓ test_full_flow
```

## 🎮 Prueba Manual del Contrato

Una vez desplegado, puedes interactuar directamente:

```bash
# Ver el CONTRACT_ID desplegado
cat contracts/contract-id.txt

# Crear una orden (como cliente)
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source cliente \
  --network testnet \
  -- \
  create_order \
  --client $(soroban keys address cliente) \
  --certifier $(soroban keys address certificador) \
  --amount 10000000 \
  --liters 5000

# Aceptar orden (como chofer)
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source chofer \
  --network testnet \
  -- \
  accept_order \
  --order_id 1 \
  --driver $(soroban keys address chofer)

# Ver detalles de la orden
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source admin \
  --network testnet \
  -- \
  get_order \
  --order_id 1
```

## 📱 API del Backend

### Endpoints Disponibles

```bash
# Health check
GET http://localhost:3000/api/health

# Obtener órdenes recientes
GET http://localhost:3000/api/orders?limit=20

# Obtener orden específica
GET http://localhost:3000/api/orders/:orderId

# Stream de eventos en tiempo real
GET http://localhost:3000/api/events/stream
```

### Ejemplo de uso:

```bash
# Ver estado del servidor
curl http://localhost:3000/api/health

# Ver órdenes
curl http://localhost:3000/api/orders
```

## 🔑 Seguridad y Garantías

### ✅ Lo que el contrato GARANTIZA:

1. **Fondos seguros**: XLM bloqueado, solo el contrato puede moverlo
2. **Certificación obligatoria**: Solo addresses autorizadas pueden certificar
3. **Doble confirmación**: Pago solo si certificado válido + cliente confirma
4. **Transparencia**: Todo el historial en el ledger público
5. **Inmutabilidad**: Nadie puede cambiar las reglas una vez desplegado

### ⚠️ Importante:

- Este es un **proyecto de demostración** para Testnet
- Para producción se requiere:
  - Auditoría de seguridad del smart contract
  - Manejo real de transferencias XLM
  - Sistema robusto de certificadores
  - KYC/AML según regulación local

## 📚 Recursos

- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Soroban Examples](https://github.com/stellar/soroban-examples)
- [Stellar SDK JS](https://stellar.github.io/js-stellar-sdk/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License

## 👥 Autores

- Documentación técnica original: Claude / Anthropic
- Implementación: Comunidad Open Source

---

**⚡ Quick Start**: `./contracts/build.sh && ./contracts/deploy.sh && cd backend && npm install && npm run dev`
