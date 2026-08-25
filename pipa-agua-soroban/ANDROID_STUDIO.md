# 📱 GUÍA: Ejecutar en Android Studio

## Sistema de Pipas de Agua - App Móvil

Esta guía te explica cómo ejecutar la app directamente en Android Studio en lugar de usar Expo Go.

---

## 🎯 Dos Opciones para Ejecutar la App

### Opción 1: Expo Go (Recomendado - MÁS FÁCIL) ⭐
- ✅ No necesitas Android Studio
- ✅ Setup en 2 minutos
- ✅ Recarga instantánea (hot reload)
- ✅ Ideal para desarrollo

### Opción 2: Android Studio (Build Nativo)
- ⚙️ Requiere más configuración
- 🏗️ Genera APK nativo
- 📦 Ideal para producción
- 🔧 Más control sobre el build

---

## 📱 OPCIÓN 1: Usar Expo Go (RECOMENDADO)

### Paso 1: Instalar Expo Go en tu teléfono
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

### Paso 2: Ejecutar el proyecto
```bash
cd frontend
npm install
npx expo start
```

### Paso 3: Escanear el QR
- Se abrirá una página web con un código QR
- Abre Expo Go en tu teléfono
- Escanea el código QR
- ¡Listo! La app se carga automáticamente

**Ventajas:**
- ⚡ Hot reload automático (cambios se ven al instante)
- 🚀 No necesitas compilar nada
- 🔄 Actualiza mientras desarrollas
- 💻 Funciona en Windows, Mac y Linux

---

## 🏗️ OPCIÓN 2: Build Nativo con Android Studio

Si necesitas generar un APK o correr en emulador de Android Studio:

### Requisitos Previos

1. **Java JDK 11 o superior**
```bash
# Verificar Java
java -version

# Si no tienes Java, instalar:
# Windows: https://www.oracle.com/java/technologies/downloads/
# Mac: brew install openjdk@11
# Linux: sudo apt install openjdk-11-jdk
```

2. **Android Studio**
- Descargar de: https://developer.android.com/studio
- Durante la instalación, asegúrate de instalar:
  - Android SDK
  - Android SDK Platform-Tools
  - Android Emulator

3. **Node.js 18+**
```bash
node --version
```

### Configurar Variables de Entorno

#### Windows:
```powershell
# Agregar a Variables de Entorno del Sistema:
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-11

# Agregar al PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

#### Mac/Linux:
```bash
# Agregar a ~/.bashrc o ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Aplicar cambios
source ~/.bashrc  # o source ~/.zshrc
```

### Generar Build de Android

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Instalar EAS CLI (Expo Application Services)
npm install -g eas-cli

# 3. Iniciar sesión en Expo (crear cuenta gratis si no tienes)
eas login

# 4. Configurar el proyecto para builds
eas build:configure

# 5. Crear build de desarrollo (APK)
eas build --profile development --platform android

# O para build de producción (AAB):
eas build --profile production --platform android
```

**Nota**: El build se hará en la nube de Expo. Te dará un link para descargar el APK cuando termine.

### Alternativa: Build Local (sin EAS)

Si quieres hacer el build completamente local:

```bash
cd frontend

# 1. Ejectar el proyecto de Android
npx expo prebuild --platform android

# 2. Esto creará una carpeta 'android' con el proyecto nativo

# 3. Abrir Android Studio
# File -> Open -> Seleccionar carpeta 'android'

# 4. Esperar a que Gradle sincronice

# 5. Hacer clic en el botón ▶️ (Run) en Android Studio
```

### Ejecutar en Emulador de Android Studio

```bash
# 1. Abrir Android Studio
# 2. Tools -> Device Manager
# 3. Create Virtual Device
# 4. Seleccionar un dispositivo (ej: Pixel 6)
# 5. Seleccionar una imagen del sistema (ej: Android 13)
# 6. Finish

# 7. Iniciar el emulador desde Device Manager

# 8. En tu terminal:
cd frontend
npx expo start --android

# O si ya hiciste prebuild:
cd android
./gradlew installDebug
```

### Ejecutar en Dispositivo Físico

```bash
# 1. Habilitar "Opciones de Desarrollador" en tu Android:
#    - Ir a Ajustes -> Acerca del teléfono
#    - Tocar "Número de compilación" 7 veces
#    - Volver y entrar a "Opciones de desarrollador"
#    - Activar "Depuración USB"

# 2. Conectar el teléfono a la PC con cable USB

# 3. Verificar que se detectó:
adb devices

# Deberías ver algo como:
# List of devices attached
# ABC123456789    device

# 4. Ejecutar la app:
cd frontend
npx expo start --android

# O si hiciste prebuild:
cd android
./gradlew installDebug
```

---

## 🔧 Solución de Problemas

### Error: "SDK location not found"
```bash
# Crear archivo local.properties en android/
echo "sdk.dir = C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk" > android/local.properties

# En Mac/Linux:
echo "sdk.dir = $HOME/Library/Android/sdk" > android/local.properties
```

### Error: "Unable to load script"
```bash
# Limpiar caché de Metro
npx expo start -c
```

### Error de Gradle
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### El emulador no inicia
- Verificar que la virtualización esté habilitada en BIOS
- Asegurarse de tener suficiente RAM (mínimo 8GB recomendado)
- Probar con un dispositivo virtual menos potente (ej: Pixel 4 en vez de Pixel 6)

### ADB no reconoce el dispositivo
```bash
# Reiniciar ADB
adb kill-server
adb start-server
adb devices
```

---

## 📊 Comparación: Expo Go vs Build Nativo

| Característica | Expo Go | Build Nativo |
|----------------|---------|--------------|
| Setup inicial | ⚡ 2 minutos | 🔧 30-60 minutos |
| Hot reload | ✅ Instantáneo | ❌ No disponible |
| Tamaño de descarga | 📱 50 MB | 📦 200+ MB |
| Desarrollo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Producción | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Acceso a APIs nativas | 🔒 Limitado | ✅ Total |
| Distribución | 🚫 Solo dev | ✅ APK/AAB |

---

## 🎯 Recomendación

### Para Desarrollo (99% de los casos):
**USA EXPO GO** ⭐

Es más rápido, más fácil y te permite iterar super rápido. Solo necesitas:
1. Instalar Expo Go en tu teléfono
2. `cd frontend && npm install && npx expo start`
3. Escanear el QR
4. ¡Listo!

### Para Producción (cuando vayas a publicar):
**USA BUILD NATIVO**

Cuando estés listo para distribuir la app en Google Play Store:
```bash
eas build --profile production --platform android
```

---

## 🚀 Quick Commands

### Desarrollo con Expo Go:
```bash
cd frontend
npm install
npx expo start
# Escanear QR con Expo Go
```

### Build para Android Studio:
```bash
cd frontend
npm install
npx expo prebuild --platform android
# Abrir 'android' folder en Android Studio
```

### Generar APK:
```bash
cd frontend
eas build --profile development --platform android
# Descargar APK del link que te da
```

---

## 💡 Tips Adicionales

### Ver logs en tiempo real:
```bash
# Con Expo Go
npx expo start

# Con dispositivo físico
adb logcat | grep ReactNative

# Filtrar solo errores
adb logcat *:E
```

### Limpiar todo y empezar de cero:
```bash
cd frontend
rm -rf node_modules
rm -rf android
rm -rf ios
npm install
npx expo start -c
```

### Cambiar puerto si 8081 está ocupado:
```bash
npx expo start --port 8082
```

---

## 📚 Recursos Adicionales

- [Expo Docs](https://docs.expo.dev/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native Docs](https://reactnative.dev/)
- [Android Studio Docs](https://developer.android.com/studio/intro)

---

## ❓ FAQ

**P: ¿Necesito pagar por Expo?**  
R: No, Expo es gratis. EAS Build tiene un plan gratuito con 30 builds/mes.

**P: ¿Puedo usar Android Studio SIN hacer prebuild?**  
R: No directamente, pero puedes abrir el proyecto Expo en Android Studio después de hacer `npx expo prebuild`.

**P: ¿Qué es mejor para este proyecto?**  
R: Para desarrollo, usa Expo Go. Es perfecto para iterar rápido en la app de pipas de agua.

**P: ¿Cómo publico en Google Play?**  
R: Usa `eas build --profile production --platform android` y sigue la guía de Expo para submissions.

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o consulta la documentación de Expo.
