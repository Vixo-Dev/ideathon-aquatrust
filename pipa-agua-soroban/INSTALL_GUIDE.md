# 🚀 GUÍA COMPLETA DE INSTALACIÓN Y EJECUCIÓN

## Sistema de Pipas de Agua - Soroban/Stellar

Esta guía te llevará paso a paso desde cero hasta tener el sistema completo funcionando.

---

## 📋 PREREQUISITOS

Antes de empezar, asegúrate de tener instalado:

### 1. Rust y Cargo
```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Agregar target WASM
rustup target add wasm32-unknown-unknown

# Verificar instalación
cargo --version
rustc --version
```

### 2. Node.js y npm
```bash
# Necesitas Node.js 18 o superior
node --version  # Debe mostrar v18.x.x o superior
npm --version
```

Si no lo tienes, descárgalo de: https://nodejs.org/

### 3. Soroban CLI
```bash
# Instalar Soroban CLI
cargo install --locked soroban-cli --features opt

# Verificar instalación
soroban --version
```

### 4. Git
```bash
git --version
```

---

## 🎯 INSTALACIÓN PASO A PASO

### PASO 1: Clonar el Proyecto

```bash
# Clonar (o descomprimir el ZIP)
cd pipa-agua-soroban

# Ver estructura
ls -la
```

Deberías ver:
```
├── contracts/      # Smart contracts
├── backend/        # API Node.js
├── frontend/       # App React Native
└── README.md
```

---

### PASO 2: Configurar Stellar Testnet

```bash
# Agregar red Testnet
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Verificar
soroban network ls
```

---

### PASO 3: Crear Identidades (Wallets)

```bash
# Crear identidad de administrador
soroban keys generate admin --network testnet

# Crear identidades de prueba
soroban keys generate cliente --network testnet
soroban keys generate chofer --network testnet
soroban keys generate certificador --network testnet

# Ver las addresses generadas
echo "Admin: $(soroban keys address admin)"
echo "Cliente: $(soroban keys address cliente)"
echo "Chofer: $(soroban keys address chofer)"
echo "Certificador: $(soroban keys address certificador)"
```

**¡IMPORTANTE!** Guarda estas addresses, las necesitarás después.

---

### PASO 4: Fondear Cuentas con XLM de Prueba

```bash
# Fondear admin
curl "https://friendbot.stellar.org?addr=$(soroban keys address admin)"

# Fondear cliente
curl "https://friendbot.stellar.org?addr=$(soroban keys address cliente)"

# Fondear chofer
curl "https://friendbot.stellar.org?addr=$(soroban keys address chofer)"

# Fondear certificador
curl "https://friendbot.stellar.org?addr=$(soroban keys address certificador)"
```

Cada cuenta recibirá 10,000 XLM de prueba.

---

### PASO 5: Compilar y Desplegar el Smart Contract

```bash
cd contracts

# Hacer ejecutables los scripts
chmod +x *.sh

# Compilar el contrato
./build.sh

# Esto tomará unos minutos la primera vez...
# Deberías ver: ✅ Contract built successfully!

# Desplegar a Testnet
./deploy.sh

# Esto generará:
# - contracts/contract-id.txt
# - contracts/.env
```

**¡SÚPER IMPORTANTE!** Copia el CONTRACT_ID que se muestra. Lo necesitarás para el backend y frontend.

Ejemplo de salida:
```
✅ Contract deployed!
📋 Contract ID: CBQHNAXSI55GX2GN6D67GK7BHKQKJAZPZCCTHQB7J2QXGV3JM7XSOE6J
```

---

### PASO 6: Configurar y Ejecutar el Backend

```bash
# Volver al directorio raíz
cd ..

# Ir a backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env desde el ejemplo
cp .env.example .env

# Editar .env con tu editor favorito
nano .env
# O usa: code .env (VS Code)
# O usa: vim .env
```

Edita `.env` y reemplaza:
```env
CONTRACT_ID=CBQHNAXSI55GX2GN6D67GK7BHKQKJAZPZCCTHQB7J2QXGV3JM7XSOE6J
```
(Usa TU CONTRACT_ID del paso anterior)

```bash
# Iniciar servidor backend
npm run dev
```

Deberías ver:
```
🚰 Pipa de Agua Backend Server
🚀 Server running on port 3000
📡 Network: testnet
📋 Contract: CBQH...
✅ Configuration valid
```

**¡Deja esta terminal abierta!** El backend debe seguir ejecutándose.

---

### PASO 7: Probar el Backend

Abre **NUEVA TERMINAL** y prueba:

```bash
# Health check
curl http://localhost:3000/api/health

# Ver órdenes
curl http://localhost:3000/api/orders

# Ver estadísticas
curl http://localhost:3000/api/stats
```

---

### PASO 8: Configurar y Ejecutar el Frontend

Abre **OTRA TERMINAL NUEVA**:

```bash
cd frontend

# Instalar dependencias
npm install

# Crear .env
cp .env.example .env

# Editar .env
nano .env
```

Configura:
```env
API_URL=http://localhost:3000
CONTRACT_ID=TU_CONTRACT_ID_AQUI
STELLAR_NETWORK=testnet
```

```bash
# Iniciar la app
npm start
```

Esto abrirá Expo DevTools en tu navegador.

---

### PASO 9: Ver la App en tu Teléfono

#### Opción A: En tu teléfono (Recomendado)

1. Instala **Expo Go** desde:
   - iOS: App Store
   - Android: Play Store

2. Escanea el QR code que aparece en la terminal

3. ¡La app se cargará en tu teléfono!

#### Opción B: En simulador (iOS/Android)

```bash
# Para Android
npm run android

# Para iOS (solo en Mac)
npm run ios

# Para web
npm run web
```

---

## 🎮 PROBANDO EL SISTEMA COMPLETO

### Crear una Orden desde la Terminal

```bash
# En una nueva terminal
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
```

Esto debería retornar: `1` (el ID de la orden)

### Aceptar la Orden (como chofer)

```bash
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source chofer \
  --network testnet \
  -- \
  accept_order \
  --order_id 1 \
  --driver $(soroban keys address chofer)
```

### Certificar el Agua

```bash
# Generar un hash de certificado (32 bytes en hex)
CERT_HASH="0101010101010101010101010101010101010101010101010101010101010101"

soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source certificador \
  --network testnet \
  -- \
  submit_cert \
  --order_id 1 \
  --certifier $(soroban keys address certificador) \
  --cert_hash $CERT_HASH
```

### Confirmar Entrega (libera el pago)

```bash
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source cliente \
  --network testnet \
  -- \
  confirm_delivery \
  --order_id 1 \
  --client $(soroban keys address cliente)
```

### Ver el Estado de la Orden

```bash
soroban contract invoke \
  --id $(cat contracts/contract-id.txt) \
  --source admin \
  --network testnet \
  -- \
  get_order \
  --order_id 1
```

---

## 🔍 EXPLORAR EN EL BLOCKCHAIN

Puedes ver todas las transacciones en:

**Stellar Expert (Testnet):**
```
https://stellar.expert/explorer/testnet/account/TU_CONTRACT_ID
```

Reemplaza `TU_CONTRACT_ID` con tu Contract ID real.

---

## 🎨 USANDO LA APP MÓVIL

1. **Home Screen**: Verás el dashboard con estadísticas
2. **Nueva Orden**: Toca el botón + o "Nueva Orden"
3. **Escanear QR**: Para confirmar entregas
4. **Historial**: Ver todas tus órdenes

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Contract not found"
```bash
# Verifica que el CONTRACT_ID sea correcto
cat contracts/contract-id.txt

# Verifica que esté en .env del backend
cat backend/.env | grep CONTRACT_ID
```

### Error: "Account not found"
```bash
# Fondea la cuenta nuevamente
curl "https://friendbot.stellar.org?addr=TU_ADDRESS"
```

### Error: "Network error" en la app
```bash
# Asegúrate que el backend esté ejecutándose
curl http://localhost:3000/api/health
```

### Puerto 3000 ocupado
```bash
# Cambia el puerto en backend/.env
PORT=3001

# Y en frontend/.env
API_URL=http://localhost:3001
```

---

## 📊 ESTRUCTURA DE ARCHIVOS IMPORTANTE

```
contracts/
  ├── contract-id.txt        ← CONTRACT_ID aquí
  ├── .env                   ← También aquí
  └── pipa-escrow/
      └── src/lib.rs         ← Código del contrato

backend/
  ├── .env                   ← Configuración backend
  └── src/
      ├── index.js           ← Servidor principal
      └── config/stellar.js  ← Conexión Stellar

frontend/
  ├── .env                   ← Configuración frontend
  ├── App.js                 ← Entrada de la app
  └── src/
      ├── screens/           ← Pantallas
      ├── components/        ← Componentes UI
      └── theme/             ← Diseño
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Rust instalado y funcionando
- [ ] Node.js 18+ instalado
- [ ] Soroban CLI instalado
- [ ] Red Testnet agregada
- [ ] Identidades creadas (admin, cliente, chofer, certificador)
- [ ] Cuentas fondeadas con XLM
- [ ] Contrato compilado (`./build.sh`)
- [ ] Contrato desplegado (`./deploy.sh`)
- [ ] CONTRACT_ID copiado a backend/.env
- [ ] CONTRACT_ID copiado a frontend/.env
- [ ] Backend ejecutándose (http://localhost:3000)
- [ ] Frontend ejecutándose (Expo)
- [ ] App visible en teléfono/simulador

---

## 🎉 ¡LISTO!

Si llegaste hasta aquí, ¡felicidades! Tienes el sistema completo funcionando:

- ✅ Smart contract desplegado en Stellar Testnet
- ✅ Backend API ejecutándose
- ✅ App móvil con diseño premium funcionando
- ✅ Puedes crear órdenes, certificar agua, y liberar pagos

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa esta guía paso a paso
2. Verifica los logs en las terminales
3. Asegúrate que todos los servicios estén ejecutándose
4. Revisa que los CONTRACT_ID coincidan en todos lados

---

## 🚀 PRÓXIMOS PASOS

1. Explora el código del smart contract en `contracts/pipa-escrow/src/lib.rs`
2. Personaliza el diseño de la app en `frontend/src/theme/`
3. Agrega nuevas funciones al contrato
4. Implementa más pantallas en la app móvil
5. Conecta con Freighter wallet para firmas reales

---

**¡Disfruta construyendo el futuro del agua con blockchain! 💧⛓️**
