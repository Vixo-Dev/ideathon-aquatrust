# 📱 Pipa de Agua - App Móvil

App móvil React Native con diseño moderno para el sistema de pipas de agua en Soroban/Stellar.

## 🎨 Características de Diseño

- **Gradientes modernos** con Expo Linear Gradient
- **Animaciones fluidas** con Reanimated
- **Componentes glassmorphism**
- **UI/UX Premium** con sombras y efectos
- **Tema personalizable** con sistema de diseño completo
- **Responsive** para todos los tamaños de pantalla

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios
```

## 📁 Estructura

```
src/
├── screens/        # Pantallas de la app
│   └── HomeScreen.js
├── components/     # Componentes reutilizables
│   └── UI.js
├── navigation/     # Navegación
├── services/       # Llamadas al backend/blockchain
├── utils/          # Utilidades
└── theme/          # Sistema de diseño
    └── index.js
```

## 🎨 Sistema de Diseño

El tema incluye:
- Paleta de colores profesional
- Gradientes predefinidos
- Tipografía escalable
- Espaciado consistente
- Sombras y elevaciones
- Border radius estandarizado

## 📱 Pantallas Implementadas

### Home Screen
- Dashboard con estadísticas
- Acciones rápidas con gradientes
- Lista de órdenes recientes
- FAB para nueva orden
- Pull-to-refresh

### Próximamente
- Nueva Orden
- Escanear QR
- Historial de Órdenes
- Detalle de Orden
- Perfil de Usuario

## 🔗 Conexión con Backend

Configura el archivo `.env`:

```env
API_URL=http://localhost:3000
CONTRACT_ID=<tu-contract-id>
STELLAR_NETWORK=testnet
```

## 📦 Dependencias Principales

- `expo` - Framework para React Native
- `@react-navigation` - Navegación
- `@stellar/stellar-sdk` - Blockchain Stellar
- `expo-linear-gradient` - Gradientes
- `react-native-qrcode-svg` - QR codes
- `expo-camera` - Scanner QR

## 🎯 Próximos Pasos

1. Implementar pantalla de Nueva Orden
2. Integrar escáner QR
3. Conectar con Freighter wallet
4. Implementar firma de transacciones
5. Añadir notificaciones push

## 📄 Licencia

MIT
