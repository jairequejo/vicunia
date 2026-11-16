# 🦙 Vicuña - Control de Inventario y Pedidos para Mundo Suni

¡Bienvenida, **Sulley**! Este es **Vicuña**, tu nuevo sistema inteligente de gestión de inventario y cálculo de costos para **Mundo Suni**. 

Este sistema ha sido diseñado con un enfoque **Mobile-First** (ideal para usarlo cómodamente desde el celular) y **Local-First** (funciona al instante sin necesidad de registrar cuentas, guardando todo en tu propio dispositivo de forma segura). Opcionalmente, puedes conectarlo a una hoja de cálculo de **Google Sheets** de forma **100% gratuita** para tener un respaldo en la nube automático.

---

## ✨ Características Principales

1. **Dashboard de Mundo Suni**:
   - **Indicadores rápidos**: Total de materiales, pedidos pendientes, valor total de tu inventario y tu ganancia proyectada.
   - **Alertas de Stock Mínimo**: Te avisa de inmediato cuando te queden pocos metros de algún hilo o pocas unidades de limpiapipas.
   - **Agenda de entregas**: Una lista organizada de tus pedidos ordenados por fecha límite para que nunca se te pase una entrega.

2. **Gestión de Inventario**:
   - Registra **Hilos**, **Limpiapipas**, **Herramientas** y más.
   - Visualiza los colores exactos de tus materiales en pantalla gracias a insignias de color dinámicas.
   - Botones rápidos de `+` y `-` para actualizar tu cantidad disponible al instante desde tu teléfono.

3. **Calculadora Flexible de Costeo e Historial de Pedidos ("El Carrito")**:
   - Agrega materiales a un pedido directamente desde tu inventario a modo de "carrito de compras".
   - **Cálculo automático**: El sistema suma el costo real de los materiales que usarás (ej. 25m de hilo amarillo y 4 limpiapipas) y te sugiere un precio de venta cobrando tu mano de obra.
   - **Que no sea rígido ("Flexibilidad en el camino")**: Si a mitad de camino necesitas agregar más materiales a un amigurumi, simplemente entra al pedido, presiona "+ Agregar", suma los materiales y el costo se recalculará automáticamente. Puedes elegir si descontar esos materiales del inventario de forma inmediata.

4. **100% Gratuito y sin Servidores**:
   - Se puede alojar gratis en **GitHub Pages** para que entres desde tu celular con un enlace privado.
   - Respaldo opcional en tu propio **Google Sheets**.

---

## 🛠️ Cómo Iniciar en tu Computadora (Local)

Para abrir la aplicación y verla funcionando en tu máquina:

1. Ve a la carpeta donde están los archivos (`mundo-suni/`).
2. Abre el archivo `mundo-suni/index.html` haciendo doble clic en él en tu navegador web (o inicia el servidor con `node server.js` y entra a <http://localhost:8080/mundo-suni/>).
3. ¡Eso es todo! La aplicación cargará con datos de demostración para que puedas probarla inmediatamente.

---

## ☁️ Paso a Paso: Conectar con Google Sheets (Sincronización Gratuita)

Si deseas que los datos se guarden automáticamente en un Google Sheet para verlos desde cualquier dispositivo o compartirlos con Jair, sigue estos sencillos pasos:

### Paso 1: Crear tu Hoja de Cálculo
1. Entra a tu cuenta de [Google Drive](https://drive.google.com) y crea un nuevo **Google Sheet** (Hoja de cálculo).
2. Ponle el nombre que desees (ej: *Base de Datos Mundo Suni*).

### Paso 2: Configurar el Google Apps Script
1. Dentro de tu Google Sheet, ve al menú superior y selecciona **Extensiones** > **Apps Script**.
2. Borra todo el código que aparezca por defecto.
3. Abre el archivo `mundo-suni/google-apps-script.js`, copia todo su contenido y pégalo en el editor de Apps Script.
4. Presiona el ícono de **Guardar** (el disquete).

### Paso 3: Publicar la API
1. En la parte superior derecha, haz clic en el botón azul **Implementar** > **Nueva implementación**.
2. En tipo de implementación, haz clic en el engranaje y selecciona **Aplicación web**.
3. Configura las siguientes opciones exactamente así:
   - *Descripción*: `API Vicuña`
   - *Ejecutar como*: **Tu cuenta de Google (Tu correo)**
   - *Quién tiene acceso*: **Cualquiera** (Esto es clave para que tu aplicación web pueda enviarle los datos).
4. Haz clic en **Implementar**. Si Google te pide autorizar permisos, acéptalos (es completamente seguro, es tu propio script).
5. Al finalizar, Google te dará una **URL de la aplicación web** (un enlace largo que termina en `/exec`). ¡Copialo!

### Paso 4: Activar la Sincronización en la App
1. Abre tu aplicación web de Vicuña en tu celular o computadora.
2. Ve a la sección de **Ajustes** (ícono de engranaje en la barra inferior).
3. Cambia el *Modo de Almacenamiento* a **Sincronizado (Google Sheets)**.
4. Pega el enlace largo en la casilla *URL de tu Web App*.
5. Haz clic en **Probar Conexión**. 
6. ¡Listo! A partir de ahora, cada vez que agregues un hilo o modifiques un pedido, este se sincronizará automáticamente y tus datos estarán 100% a salvo en tu Google Sheet.

---

## 🚀 Cómo Subir la Web a Internet (Gratis para siempre)

Puedes hospedar esta página web en **GitHub Pages** para que tanto tú como Jair puedan abrirla en su celular desde cualquier parte del mundo usando un link como `https://jair.github.io/vicunia/`.

1. Sube esta carpeta (`vicunia`) a un repositorio público en tu cuenta de GitHub.
2. En GitHub, entra al repositorio, ve a **Settings** (Ajustes) > **Pages** (en el menú izquierdo).
3. En la sección **Build and deployment**, selecciona la rama `main` y la carpeta `/ (root)`. Presiona **Save**.
4. Espera 1 minuto y GitHub te dará el enlace de tu sitio web listo para usar. Puedes añadirlo a la pantalla de inicio de tu celular para que se sienta como una aplicación nativa.
