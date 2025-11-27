# 🤖 ECOChat API

API RESTful para sistema de chat inteligente con integración de OpenAI, gestión de documentos, asistentes virtuales y búsqueda vectorial.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Librería OpenAI](#-librería-openai)
- [API Endpoints](#-api-endpoints)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Documentación](#-documentación)

## ✨ Características

- 🤖 **Asistentes Inteligentes**: Integración completa con OpenAI Assistants API
- 📄 **Gestión de Documentos**: Upload, procesamiento y búsqueda vectorial en documentos
- 💬 **Conversaciones**: Sistema de threads para mantener contexto en conversaciones
- 🔍 **Búsqueda Semántica**: File search en múltiples vector stores
- ⚡ **Streaming**: Respuestas en tiempo real con Server-Sent Events
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación y autorización
- 📊 **Multi-tenant**: Soporte para múltiples instancias y usuarios
- 🎯 **Versionado API**: v1 y v2 con endpoints organizados
- 📈 **Monitoreo**: Integración con Sentry y OpenTelemetry
- 🗄️ **Base de Datos**: MySQL con Sequelize ORM

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **OpenAI SDK** - Integración con GPT-4 y Assistants API
- **Sequelize** - ORM para MySQL
- **Passport.js** - Autenticación (JWT + Local)
- **Joi** - Validación de datos
- **Swagger** - Documentación automática de API
- **Sentry** - Monitoreo de errores
- **OpenTelemetry** - Observabilidad
- **Multer** - Upload de archivos

## 🚀 Instalación

### Prerequisitos

- Node.js 14.x o superior
- MySQL 5.7 o superior
- Cuenta de OpenAI con API Key

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd API-ECOCHAT

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Ejecutar migraciones de base de datos
npm run migrations:run

# 5. Iniciar el servidor en modo desarrollo
npm run dev
```

## ⚙️ Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Servidor
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Base de Datos
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ecochat_db
DB_HOST=localhost
DB_PORT=3306

# OpenAI
OPENAI_API_KEY=sk-tu-api-key-aqui

# JWT
JWT_SECRET=tu-jwt-secret-seguro

# Módulos externos (opcional)
MODULE_PIPELINE=http://pipeline-service-url
MODULE_EXTRACTOR=http://extractor-service-url
MODULE_SCRAPING=http://scraping-service-url
MODULE_LANGUAGE_DETECTOR=http://detector-service-url
MODULE_TRANSLATOR=http://translator-service-url

# Sentry (opcional)
SENTRY_DSN=tu-sentry-dsn
```

### Contraseña por defecto (bcrypt hash)

```
$2a$10$XufU.6H2sjEoZK3kcr2EPuuFRd6jh3p9O3m4bYspEREz9bZws4/4i
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar con nodemon (hot reload)

# Producción
npm start                # Iniciar servidor

# Base de Datos
npm run migrations:run       # Ejecutar migraciones
npm run migrations:revert    # Revertir última migración
npm run migrations:delete    # Revertir todas las migraciones
npm run migrations:generate  # Generar nueva migración

# Linting
npm run lint             # Ejecutar ESLint
```

## 📁 Estructura del Proyecto

```
API-ECOCHAT/
├── cache/                      # Sistema de caché
├── config/                     # Configuración
│   └── config.js              # Variables de entorno
├── db/                        # Base de datos
│   ├── models/                # Modelos Sequelize
│   └── migrations/            # Migraciones
├── libs/                      # Librerías personalizadas
│   ├── openai.js             # 🔥 Wrapper completo de OpenAI
│   ├── sequelize.js          # Configuración de Sequelize
│   └── postgres.pool.js      # Pool de conexiones
├── middlewares/               # Middlewares Express
│   ├── auth.handler.js       # Autenticación JWT
│   ├── error.handler.js      # Manejo de errores
│   ├── validator.handler.js  # Validación con Joi
│   └── upload.handler.js     # Upload de archivos
├── routes/                    # Rutas de la API
│   ├── v1/                   # API versión 1
│   └── v2/                   # API versión 2
├── schemas/                   # Esquemas de validación (Joi)
├── services/                  # Lógica de negocio
├── swagger/                   # Definiciones Swagger
├── templateHTML/              # Templates de emails
├── utils/                     # Utilidades
│   └── auth/                 # Estrategias de autenticación
├── uploads/                   # Archivos subidos
├── index.js                   # Punto de entrada
├── swaggerConfig.js          # Configuración de Swagger
└── package.json
```

## 🤖 Librería OpenAI

Hemos desarrollado un wrapper completo para la API de OpenAI que simplifica el uso de asistentes, documentos y búsqueda vectorial.

### Importación

```javascript
const { OpenAIManager } = require("./libs/openai");
const manager = new OpenAIManager();
```

### Funciones Principales

#### 📁 Vector Stores

```javascript
// Crear vector store
const vectorStore = await manager.createVectorStore("Mi Base de Conocimiento", {
  metadata: { department: "legal" },
});

// Obtener información
const info = await manager.getVectorStore("vs_abc123");

// Actualizar
await manager.updateVectorStore("vs_abc123", { name: "Nuevo Nombre" });

// Eliminar
await manager.deleteVectorStore("vs_abc123");
```

#### 📄 Archivos

```javascript
// Subir archivo
const file = await manager.uploadFile("./documento.pdf");
console.log(file.fileId); // file_abc123

// Asociar archivo a vector store
await manager.createVectorStoreFile("vs_abc123", "file_abc123", true);

// Listar archivos
const files = await manager.listVectorStoreFiles("vs_abc123");

// Eliminar archivo
await manager.deleteFile("file_abc123");
```

#### 🤖 Asistentes

```javascript
// Crear asistente con file search
const assistant = await manager.createAssistant({
  name: "Asesor Legal",
  instructions: "Eres un experto en derecho corporativo.",
  model: "gpt-4-turbo-preview",
  tools: [{ type: "file_search" }],
  vectorStoreIds: ["vs_abc123"],
});

// Actualizar asistente
await manager.updateAssistant("asst_abc123", {
  instructions: "Nueva instrucción",
});

// Asignar vector stores
await manager.assignVectorStoresToAssistant("asst_abc123", [
  "vs_123",
  "vs_456",
]);

// Agregar vector store (mantiene existentes)
await manager.addVectorStoreToAssistant("asst_abc123", "vs_new");

// Obtener vector stores del asistente
const vectorStores = await manager.getAssistantVectorStores("asst_abc123");
```

#### 💬 Conversaciones (Threads)

```javascript
// Crear thread
const thread = await manager.createThread({ userId: "123" });

// Agregar mensaje
await manager.createMessage(thread.id, "¿Cómo estás?", "user");

// Hacer pregunta al asistente
const result = await manager.askAssistant(
  "asst_abc123",
  "¿Qué dice el contrato?",
  "thread_xyz789",
  {
    instructions: "Responde en español",
  }
);

console.log(result.answer);
```

#### ⚡ Streaming

```javascript
// Respuesta en tiempo real
await manager.askAssistantStream(
  "asst_abc123",
  "¿Cuáles son los términos?",
  "thread_xyz789",
  (chunk) => {
    process.stdout.write(chunk); // Muestra en tiempo real
  },
  (fullText) => {
    console.log("\n✅ Completado");
  }
);
```

#### 🚀 Responses API (Nuevo)

```javascript
// Respuesta directa sin threads
const response = await manager.createResponse(
  "¿Qué dice sobre confidencialidad?",
  {
    model: "gpt-4o-2024-11-20",
    instructions: "Eres un asesor legal.",
    vectorStoreIds: ["vs_abc123"],
    maxNumResults: 3,
    includeSearchResults: true,
  }
);

console.log(response.output);
console.log(response.searchResults); // Resultados de búsqueda detallados
```

#### 🔍 Búsqueda Directa

```javascript
// Buscar en documentos sin generar respuesta larga
const results = await manager.searchInVectorStores(
  "términos de pago",
  ["vs_abc123", "vs_xyz456"],
  5
);

console.log(results.answer);
console.log(results.sources); // [{ score, filename, fileId, content }]
```

### Eventos Avanzados

```javascript
// Control total de eventos
await manager.createRunWithEvents("thread_xyz789", "asst_abc123", {
  onTextDelta: (delta) => process.stdout.write(delta.value),
  onToolCallCreated: (tool) => console.log("🔧 Usando:", tool.type),
  onMessageDone: (msg) => console.log("✅ Mensaje:", msg.id),
  onError: (err) => console.error("❌ Error:", err),
});
```

## 🌐 API Endpoints

### Base URL

```
http://localhost:3000/service/ecochat/api
```

### Autenticación

```bash
POST /v1/auth/login
POST /v1/auth/recovery
POST /v1/auth/change-password
```

### Usuarios e Instancias

```bash
GET    /v1/instances
POST   /v1/instances
GET    /v1/instances/:instanceId
PUT    /v1/instances/:instanceId
DELETE /v1/instances/:instanceId
```

### Asistentes

```bash
GET    /v1/instances/:instanceId/assistants
POST   /v1/instances/:instanceId/assistants
GET    /v1/instances/:instanceId/assistants/:assistantId
PUT    /v1/instances/:instanceId/assistants/:assistantId
DELETE /v1/instances/:instanceId/assistants/:assistantId
```

### Documentos y Fuentes

```bash
GET    /v1/instances/:instanceId/sources
POST   /v1/instances/:instanceId/sources
PUT    /v1/instances/:instanceId/sources/:sourceId
DELETE /v1/instances/:instanceId/sources/:sourceId
POST   /v1/instances/:instanceId/sources/:sourceId/upload
```

### Sesiones y Consultas

```bash
GET    /v1/instances/:instanceId/sessions
POST   /v1/instances/:instanceId/sessions
GET    /v1/instances/:instanceId/sessions/:sessionId/queries
POST   /v1/instances/:instanceId/sessions/:sessionId/questions
```

### Colecciones

```bash
GET    /v1/instances/:instanceId/collections
POST   /v1/instances/:instanceId/collections
PUT    /v1/instances/:instanceId/collections/:collectionId
DELETE /v1/instances/:instanceId/collections/:collectionId
```

## 📚 Documentación

### Swagger UI

Una vez iniciado el servidor, accede a la documentación interactiva:

```
http://localhost:3000/service/ecochat/docs
```

### Healthcheck

Verificar que el servidor está funcionando:

```bash
curl http://localhost:3000/service/ecochat/healthcheck
```

Respuesta:

```json
{
  "message": "It's working!"
}
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Asistente con Documentos

```javascript
const { OpenAIManager } = require("./libs/openai");
const manager = new OpenAIManager();

async function crearAsistenteCompleto() {
  // 1. Crear vector store
  const vectorStore = await manager.createVectorStore("Documentos Legales");

  // 2. Subir documentos
  const file1 = await manager.uploadFile("./contrato.pdf");
  const file2 = await manager.uploadFile("./politicas.pdf");

  // 3. Asociar archivos
  await manager.createVectorStoreFile(vectorStore.id, file1.fileId, true);
  await manager.createVectorStoreFile(vectorStore.id, file2.fileId, true);

  // 4. Crear asistente
  const assistant = await manager.createAssistant({
    name: "Asesor Legal",
    instructions: "Eres un experto en derecho corporativo.",
    model: "gpt-4-turbo-preview",
    tools: [{ type: "file_search" }],
    vectorStoreIds: [vectorStore.id],
  });

  // 5. Hacer pregunta
  const result = await manager.askAssistant(
    assistant.id,
    "¿Qué dice el contrato sobre confidencialidad?"
  );

  console.log("Respuesta:", result.answer);

  return {
    assistantId: assistant.id,
    vectorStoreId: vectorStore.id,
    threadId: result.threadId,
  };
}
```

### Ejemplo 2: API Endpoint con Streaming

```javascript
router.post("/chat/stream", async (req, res) => {
  const { assistantId, question, threadId } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const manager = new OpenAIManager();

  await manager.askAssistantStream(
    assistantId,
    question,
    threadId,
    (chunk) => {
      res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`);
    },
    (fullText) => {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    }
  );
});
```

### Ejemplo 3: Búsqueda Rápida con Responses API

```javascript
async function buscarEnDocumentos(pregunta) {
  const manager = new OpenAIManager();

  const response = await manager.createResponse(pregunta, {
    model: "gpt-4o-2024-11-20",
    instructions: "Analiza los documentos y responde concisamente.",
    vectorStoreIds: ["vs_abc123"],
    maxNumResults: 5,
    includeSearchResults: true,
  });

  console.log("Respuesta:", response.output);
  console.log("\nFuentes:");
  response.searchResults.forEach((result, i) => {
    console.log(`${i + 1}. ${result.file_name} (score: ${result.score})`);
  });

  return response;
}
```

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Validación de datos con Joi
- ✅ Rate limiting (configurar según necesidad)
- ✅ CORS configurado
- ✅ Sanitización de inputs
- ✅ Bcrypt para passwords

## 🚧 Estado del Proyecto

- ✅ v1 API - Estable
- 🚀 v2 API - En desarrollo activo
- 📝 Documentación - En progreso

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

ISC

## 👨‍💻 Autor

**Abraham Armas**

## 🆘 Soporte

Para soporte y preguntas, contacta al equipo de desarrollo.

---
