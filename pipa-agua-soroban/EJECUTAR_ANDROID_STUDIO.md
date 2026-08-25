# 🎯 EJECUTAR EN ANDROID STUDIO - Solo Emulador

## Guía definitiva para correr la app SOLO desde Android Studio (SIN teléfono físico)

---

## 📱 Lo que vamos a hacer:

1. ✅ Instalar Android Studio
2. ✅ Crear un emulador Android virtual
3. ✅ Convertir el proyecto Expo a Android nativo
4. ✅ Abrir y ejecutar desde Android Studio
5. ✅ Ver la app corriendo en el emulador

**Tiempo estimado: 20-30 minutos** (la primera vez)

---

## 🔧 PARTE 1: Instalar y Configurar Android Studio

### Paso 1.1: Descargar Android Studio

Ir a: https://developer.android.com/studio

Descargar e instalar Android Studio (última versión)

### Paso 1.2: Configuración Inicial

Al abrir Android Studio por primera vez:

1. **Welcome Screen** → Click en "More Actions" → "SDK Manager"
2. En la pestaña **SDK Platforms**, marcar:
   - ✅ Android 13.0 (API level 33)
   - ✅ Android 12.0 (API level 31)

3. En la pestaña **SDK Tools**, marcar:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM) - solo Windows/Mac Intel

4. Click en **Apply** y esperar a que descargue todo (puede tardar 10-15 min)

### Paso 1.3: Crear Emulador Android

1. En Android Studio: **Tools** → **Device Manager**
2. Click en **"Create Device"**
3. Seleccionar **Phone** → **Pixel 6** (recomendado)
4. Click **Next**
5. Seleccionar **System Image**:
   - Buscar **"Tiramisu" (API 33)** o **"S" (API 31)**
   - Si dice "Download", hacer click para descargar
6. Click **Next**
7. En **AVD Name**, dejar el nombre por defecto
8. **Finish**

✅ ¡Ya tienes tu emulador creado!

---

## 🔧 PARTE 2: Configurar Variables de Entorno

### Windows:

1. Abrir **"Variables de entorno"** (buscar en el menú inicio)
2. En **Variables del sistema**, click **"Nueva"**:

```
Nombre: ANDROID_HOME
Valor: C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

3. Editar la variable **Path** y agregar:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
```

4. Click **OK** en todo

5. **Reiniciar la terminal** (o la PC para estar seguro)

### Mac:

1. Abrir terminal
2. Editar el archivo de configuración:

```bash
# Si usas zsh (Mac moderno):
nano ~/.zshrc

# Si usas bash:
nano ~/.bashrc
```

3. Agregar estas líneas al final:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

4. Guardar (Ctrl+O, Enter, Ctrl+X)

5. Aplicar cambios:
```bash
source ~/.zshrc  # o source ~/.bashrc
```

### Linux:

```bash
# Editar bashrc
nano ~/.bashrc

# Agregar al final:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Aplicar
source ~/.bashrc
```

### Verificar que funcionó:

```bash
# Abrir NUEVA terminal y ejecutar:
adb version

# Deberías ver algo como:
# Android Debug Bridge version 1.0.41
```

---

## 🚀 PARTE 3: Convertir Proyecto Expo a Android Nativo

### Paso 3.1: Preparar el Proyecto

```bash
# Ir a la carpeta del frontend
cd pipa-agua-soroban/frontend

# Instalar dependencias
npm install

# Instalar Expo CLI globalmente (si no lo tienes)
npm install -g expo-cli
```

### Paso 3.2: Generar Código Android Nativo

```bash
# Este comando crea la carpeta 'android' con el proyecto nativo
npx expo prebuild --platform android

# Esperar a que termine (puede tardar 2-3 minutos)
```

✅ Esto crea una carpeta `android` dentro de `frontend`

### Paso 3.3: Configurar android/local.properties

```bash
# Crear archivo de configuración local
cd android
```

**Windows**, crear archivo `local.properties` con este contenido:
```
sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

**Mac**, crear archivo `local.properties`:
```
sdk.dir=/Users/TU_USUARIO/Library/Android/sdk
```

**Linux**, crear archivo `local.properties`:
```
sdk.dir=/home/TU_USUARIO/Android/Sdk
```

O crear el archivo desde la terminal:

```bash
# Windows (PowerShell):
echo "sdk.dir=C:\\Users\\$env:USERNAME\\AppData\\Local\\Android\\Sdk" > local.properties

# Mac/Linux:
echo "sdk.dir=$HOME/Library/Android/sdk" > local.properties  # Mac
echo "sdk.dir=$HOME/Android/Sdk" > local.properties  # Linux
```

---

## 📂 PARTE 4: Abrir Proyecto en Android Studio

### Paso 4.1: Importar el Proyecto

1. Abrir **Android Studio**
2. Click en **"Open"** (o File → Open)
3. Navegar a: `pipa-agua-soroban/frontend/android`
4. Seleccionar la carpeta **android** y click **OK**

### Paso 4.2: Esperar a que Gradle Sincronice

- Android Studio empezará a sincronizar automáticamente
- Verás una barra de progreso abajo: "Gradle sync in progress..."
- **ESPERAR** hasta que termine (puede tardar 5-10 minutos la primera vez)
- Si sale algún error de sincronización, ver sección "Troubleshooting" abajo

### Paso 4.3: Verificar Configuración

En la parte superior de Android Studio deberías ver:

```
[app] | [Pixel 6 API 33] | ▶️
```

Si no ves el emulador:
- Click en la lista de dispositivos
- Debería aparecer "Pixel 6 API 33" (o el que creaste)

---

## ▶️ PARTE 5: EJECUTAR LA APP

### Método 1: Desde Android Studio (RECOMENDADO)

1. **Iniciar el emulador**:
   - Click en el botón de **play** (▶️) en la barra superior
   - O: Tools → Device Manager → Click en el ▶️ del Pixel 6

2. **Esperar a que arranque el emulador** (puede tardar 1-2 minutos)
   - Verás una ventana con un teléfono Android virtual

3. **En una terminal SEPARADA**, iniciar Metro bundler:
   ```bash
   # En la carpeta frontend (NO android)
   cd pipa-agua-soroban/frontend
   npx expo start
   ```

4. **De vuelta en Android Studio**:
   - Click en el botón ▶️ (Run 'app')
   - O presionar **Shift + F10** (Windows/Linux)
   - O presionar **Control + R** (Mac)

5. **Esperar** a que compile e instale (2-3 minutos la primera vez)

✅ ¡La app debería aparecer en el emulador!

### Método 2: Desde Terminal

```bash
# Terminal 1: Metro bundler
cd pipa-agua-soroban/frontend
npx expo start

# Terminal 2: Instalar app en emulador
cd pipa-agua-soroban/frontend/android
./gradlew installDebug

# En Windows:
gradlew.bat installDebug
```

---

## 🎮 Usar el Emulador

Una vez que la app está corriendo:

### Controles del Emulador:

- **Click**: Simular toque en pantalla
- **Click y arrastrar**: Simular swipe/scroll
- **Panel lateral derecho**: Botones de hardware
  - 🔙 Botón Back
  - 🏠 Botón Home
  - 📱 Rotación de pantalla
  - 📸 Screenshot

### Hot Reload:

Cuando hagas cambios en el código:

1. **Android Studio detecta cambios automáticamente**
2. En el emulador, presiona **R** dos veces rápidamente
3. O sacudir el emulador: Ctrl+M (Windows/Linux) o Cmd+M (Mac)
4. Seleccionar "Reload"

---

## 🔧 TROUBLESHOOTING

### Error: "SDK location not found"

**Solución:**
```bash
# Ir a android/
cd pipa-agua-soroban/frontend/android

# Crear local.properties
# Windows:
echo sdk.dir=C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk > local.properties

# Mac:
echo "sdk.dir=$HOME/Library/Android/sdk" > local.properties
```

### Error: "Gradle sync failed"

**Solución 1:** Limpiar caché
```bash
cd android
./gradlew clean

# Windows:
gradlew.bat clean
```

**Solución 2:** Invalidar caché en Android Studio
- File → Invalidate Caches → Invalidate and Restart

### Error: "Unable to load script"

**Solución:** Asegurarse de que Metro está corriendo
```bash
cd pipa-agua-soroban/frontend
npx expo start
```

### Error: "Emulator: emulator.exe has stopped working"

**Solución:**
1. Cerrar emulador
2. Tools → Device Manager
3. Editar emulador (⚙️) → Show Advanced Settings
4. Cambiar "Graphics" a "Software" en vez de "Hardware"
5. Click Finish
6. Iniciar de nuevo

### Error: "INSTALL_FAILED_INSUFFICIENT_STORAGE"

**Solución:** 
1. En Device Manager, editar el emulador
2. Aumentar "Internal Storage" a 4GB o más
3. Click Finish

### La app está en blanco / no carga

**Solución:**
```bash
# Limpiar todo y reinstalar
cd pipa-agua-soroban/frontend
rm -rf android
npx expo prebuild --platform android

# Luego volver a abrir en Android Studio
```

### "Cannot run program adb"

**Solución:** Verificar variables de entorno
```bash
# Verificar ANDROID_HOME
echo $ANDROID_HOME  # Mac/Linux
echo %ANDROID_HOME%  # Windows

# Verificar adb
adb version

# Si no funciona, revisar la Parte 2 de esta guía
```

---

## 💡 TIPS PARA TRABAJAR MÁS RÁPIDO

### 1. Mantener el Emulador Abierto

No cierres el emulador entre sesiones de desarrollo:
- Déjalo minimizado
- La segunda vez arranca en 10 segundos en vez de 2 minutos

### 2. Usar Snapshots

En Device Manager → Editar emulador:
- ✅ Enable "Store a snapshot for faster startup"
- La próxima vez arranca instantáneamente

### 3. Hot Reload Automático

Hacer cambios en el código y presionar **R+R** en el emulador para ver cambios al instante

### 4. Ver Logs en Tiempo Real

En Android Studio:
- View → Tool Windows → Logcat
- Filtrar por "ReactNative" para ver solo logs de tu app

### 5. Debugging

En el emulador:
- Presionar Ctrl+M (o Cmd+M en Mac)
- Seleccionar "Debug JS Remotely"
- Abre Chrome DevTools para debuggear

---

## 📋 CHECKLIST RÁPIDO

Antes de ejecutar, verifica:

- [ ] ✅ Android Studio instalado
- [ ] ✅ SDK 31 o 33 descargado
- [ ] ✅ Emulador creado (Pixel 6)
- [ ] ✅ Variables de entorno configuradas (ANDROID_HOME)
- [ ] ✅ `npm install` ejecutado en frontend/
- [ ] ✅ `npx expo prebuild` ejecutado
- [ ] ✅ Carpeta `android` existe en frontend/
- [ ] ✅ Archivo `android/local.properties` creado
- [ ] ✅ Proyecto android abierto en Android Studio
- [ ] ✅ Gradle sincronizado exitosamente

Si todos tienen ✅, estás listo para:

```bash
# Terminal 1:
cd frontend && npx expo start

# Android Studio:
Click ▶️ (Run)
```

---

## 🎯 RESUMEN ULTRA-RÁPIDO

```bash
# 1. Instalar Android Studio + crear emulador Pixel 6

# 2. Configurar variables de entorno (ANDROID_HOME)

# 3. Preparar proyecto:
cd pipa-agua-soroban/frontend
npm install
npx expo prebuild --platform android

# 4. Abrir Android Studio
# File → Open → frontend/android

# 5. Ejecutar:
# Terminal: npx expo start
# Android Studio: Click ▶️
```

---

## 🎊 ¡ÉXITO!

Si ves la app corriendo en el emulador, **¡lo lograste!**

Ahora puedes:
- ✨ Hacer cambios en el código
- 🔄 Presionar R+R para ver cambios
- 🐛 Debuggear con Chrome DevTools
- 📱 Probar toda la funcionalidad sin un teléfono físico

---

## 📚 Siguientes Pasos

Una vez que la app esté corriendo:

1. **Explorar la app** - Navega por HomeScreen
2. **Probar crear orden** - Click en "Solicitar Pipa de Agua"
3. **Ver el código** - Edita `frontend/src/screens/HomeScreen.js`
4. **Hot reload** - Guarda cambios y presiona R+R en emulador

---

**¿Algún error?** Revisa la sección Troubleshooting arriba o abre un issue en el repositorio.

**¡Disfruta desarrollando! 🚀**
