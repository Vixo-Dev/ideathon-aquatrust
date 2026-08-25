# 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN

## Sistema de Pipas de Agua - Soroban/Stellar

Esta guía te llevará paso a paso desde cero hasta tener todo el sistema corriendo.

---

## 📋 Requisitos Previos

### 1. Rust (para compilar contratos)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
```

### 2. Node.js 18+
```bash
# Verificar versión
node --version

# Si no tienes Node.js, instálalo desde https://nodejs.org/
# O usa nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 3. Soroban CLI
```bash
cargo install --locked soroban-cli --features opt
```

### 4. Expo CLI (para la app móvil)
```bash
npm install -g expo-cli
```

### 5. Expo Go App (en tu teléfono)
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 🏗️ PASO 1: Configurar Red Stellar Testnet

```bash
# Agregar red testnet
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Verificar que se agregó correctamente
soroban network ls
```

---

## 🔑 PASO 2: Crear Identidades de Prueba

```bash
# Crear admin (administrador del contrato)
soroban keys generate admin --network testnet

# Crear cliente
soroban keys generate cliente --network testnet

# Crear chofer
soroban keys generate chofer --network testnet

# Crear certificador
soroban keys generate certificador --network testnet

# Ver las direcciones generadas
echo "Admin: $(soroban keys address admin)"
echo "Cliente: $(soroban keys address cliente)"
echo "Chofer: $(soroban keys address chofer)"
echo "Certificador: $(soroban keys address certificador)"
```

---

## 💰 PASO 3: Fondear Cuentas con XLM de Prueba

```bash
# Fondear admin
curl "https://friendbot.stellar.org?addr=$(soroban keys address admin)"
sleep 2

# Fondear cliente
curl "https://friendbot.stellar.org?addr=$(soroban keys address cliente)"
sleep 2

# Fondear chofer
curl "https://friendbot.stellar.org?addr=$(soroban keys address chofer)"
sleep 2

# Fondear certificador
curl "https://friendbot.stellar.org?addr=$(soroban keys address certificador)"
```

---

## 📦 PASO 4: Compilar y Desplegar Smart Contract

```bash
# Navegar a la carpeta de contratos
cd contracts

# Compilar el contrato
./build.sh

# Desplegar a testnet
./deploy.sh

# Esto generará un CONTRACT_ID que necesitarás después
# Se guarda automáticamente en contracts/contract-id.txt
```

**IMPORTANTE**: Guarda el CONTRACT_ID que aparece al final. Lo necesitarás para el backend y frontend.

---

## 🖥️ PASO 5: Configurar y Ejecutar Backend

```bash
# Abrir NUEVA terminal
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env y agregar el CONTRACT_ID
# En MacOS/Linux:
nano .env

# En Windows:
notepad .env

# Pega el CONTRACT_ID del paso anterior:
# CONTRACT_ID=CA...tu-contract-id-aqui...
```

Contenido del archivo `.env`:
```env
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CA...tu-contract-id-aqui...
PORT=3000
NODE_ENV=development
```

Guardar y ejecutar:
```bash
# Iniciar el servidor
npm run dev

# Deberías ver:
# 🚀 Server running on port 3000
# 📋 Contract: CA...
# ✅ Configuration valid
```

---

## 📱 PASO 6: Configurar y Ejecutar App Móvil

```bash
# Abrir OTRA NUEVA terminal
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env
nano .env  # o notepad .env en Windows
```

Contenido del archivo `.env`:
```env
API_URL=http://localhost:3000
STELLAR_NETWORK=testnet
CONTRACT_ID=CA...tu-contract-id-aqui...
```

Iniciar la app:
```bash
# Iniciar Expo
npx expo start

# Se abrirá una página web con un QR code
```

**En tu teléfono:**
1. Abre la app "Expo Go"
2. Escanea el código QR que aparece en la terminal/navegador
3. La app se cargará en tu teléfono

---

## ✅ VERIFICACIÓN: Todo está funcionando

### Verificar Backend
```bash
curl http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "network": "testnet",
  "contractId": "CA..."
}
```

### Verificar Smart Contract
```bash
# Ver el número de órdenes (debería ser 0 al inicio)
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source admin \
  --network testnet \
  -- \
  get_order_count
```

---

## 🎮 PASO 7: Probar el Sistema Completo

### Opción A: Desde la App Móvil (Recomendado)

1. **Abrir la app** en tu teléfono (debería estar corriendo si seguiste el paso 6)
2. **Ver la pantalla Home** con el dashboard
3. **Tap en "Solicitar Pipa de Agua"**
4. **Configurar tu orden:**
   - Cantidad: 5000 litros
   - Seleccionar un certificador
5. **Crear orden**

### Opción B: Desde la Terminal (Prueba Manual)

```bash
# 1. Cliente crea una orden
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

# 2. Chofer acepta la orden
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source chofer \
  --network testnet \
  -- \
  accept_order \
  --order_id 1 \
  --driver $(soroban keys address chofer)

# 3. Certificador valida el agua
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source certificador \
  --network testnet \
  -- \
  submit_cert \
  --order_id 1 \
  --certifier $(soroban keys address certificador) \
  --cert_hash 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# 4. Cliente confirma entrega (esto libera el pago automáticamente)
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source cliente \
  --network testnet \
  -- \
  confirm_delivery \
  --order_id 1 \
  --client $(soroban keys address cliente)

# 5. Ver el estado final de la orden
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source admin \
  --network testnet \
  -- \
  get_order \
  --order_id 1
```

---

## 🐛 Solución de Problemas

### Error: "Contract not found"
- Verifica que copiaste el CONTRACT_ID correcto
- Asegúrate de estar usando `--network testnet`

### Error: "Account not found"
- Las cuentas necesitan ser fondeadas primero
- Ejecuta nuevamente el comando de friendbot

### Backend no inicia
- Verifica que Node.js >= 18 esté instalado
- Verifica que el archivo .env tenga el CONTRACT_ID correcto
- Intenta `rm -rf node_modules && npm install`

### App móvil no carga
- Asegúrate de estar en la misma red WiFi (computadora y teléfono)
- Intenta cerrar Expo y ejecutar `npx expo start -c`
- Verifica que Expo Go esté actualizado

### Contract build falla
- Verifica que Rust esté instalado: `rustc --version`
- Verifica target wasm: `rustup target list | grep wasm32`
- Reinstala soroban-cli: `cargo install --locked soroban-cli --features opt --force`

---

## 📊 Comandos Útiles

### Ver logs del backend
```bash
cd backend
npm run dev
```

### Ver logs de la app
```bash
cd frontend
npx expo start
```

### Limpiar y rebuild del contrato
```bash
cd contracts/pipa-escrow
cargo clean
cd ..
./build.sh
```

### Ver balance de una cuenta
```bash
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source admin \
  --network testnet \
  -- \
  get_order_count
```

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Smart contract desplegado en Stellar Testnet
- ✅ Backend corriendo en http://localhost:3000
- ✅ App móvil corriendo en tu teléfono
- ✅ Sistema completo funcionando

### Próximos Pasos:
1. Explora todas las funciones de la app
2. Crea múltiples órdenes
3. Simula el flujo completo cliente → chofer → certificador
4. Revisa los eventos en el backend
5. Consulta el historial en el ledger de Stellar

---

## 📚 Recursos Adicionales

- **Stellar Docs**: https://developers.stellar.org/
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Testnet Explorer**: https://stellar.expert/explorer/testnet
- **Friendbot**: https://laboratory.stellar.org/#create-account

---

**¿Necesitas ayuda?** Revisa el README.md principal o abre un issue en el repositorio.
