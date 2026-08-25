# ⚡ INICIO RÁPIDO - 5 Minutos

## Para impacientes que quieren ver esto funcionando YA

### 1️⃣ Instalar prerequisitos (2 min)
```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Soroban CLI
cargo install --locked soroban-cli --features opt

# Node.js (si no lo tienes)
# https://nodejs.org/
```

### 2️⃣ Setup Stellar (30 seg)
```bash
# Configurar testnet
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Crear cuentas y fondearlas
soroban keys generate admin --network testnet
curl "https://friendbot.stellar.org?addr=$(soroban keys address admin)"
```

### 3️⃣ Desplegar contrato (1 min)
```bash
cd contracts
chmod +x *.sh
./build.sh
./deploy.sh

# GUARDA EL CONTRACT_ID QUE APARECE
```

### 4️⃣ Backend (30 seg)
```bash
cd ../backend
npm install
cp .env.example .env
# Edita .env y pega el CONTRACT_ID
nano .env

npm run dev
# ✅ Backend corriendo en http://localhost:3000
```

### 5️⃣ App Móvil (1 min)
```bash
cd ../frontend
npm install
cp .env.example .env
# Edita .env y pega el CONTRACT_ID
nano .env

npx expo start

# Escanea el QR con Expo Go en tu teléfono
```

## 🎉 ¡LISTO!

Abre la app en tu teléfono y:
1. Tap en "Solicitar Pipa de Agua"
2. Configura tu orden
3. ¡Crea tu primera orden en blockchain!

---

**¿Problemas?** Lee [GUIA_INSTALACION.md](./GUIA_INSTALACION.md) para instrucciones completas.

**¿Quieres entender el código?** Lee [docs/CONTRATO.md](./docs/CONTRATO.md) para la documentación técnica.
