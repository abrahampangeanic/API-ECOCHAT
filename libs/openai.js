const { config } = require('../config/config');
const OpenAI = require('openai');
const fs = require('fs');
const {
  instructionsWebSearch,
  instructionContext,
  // instructions,
} = require('./openai-instruction');

// Instancia principal de OpenAI
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Sistema de gestión de documentos con OpenAI
 * Permite crear espacios de trabajo (vector stores) y consultarlos
 */
class OpenAIManager {
  constructor(apiKey = null) {
    this.openai = apiKey ? new OpenAI({ apiKey }) : openai;
    this.workspaces = new Map(); // groupId -> vectorStoreId
    this.assistants = new Map(); // groupId -> assistantId
  }

  // ==================== VECTOR STORES ====================

  /**
   * Crear un nuevo vector store
   * @param {string} name - Nombre del vector store
   * @param {object} options - Opciones adicionales (expires_after, metadata)
   * @returns {object} - { id, name, status, created_at }
   */
  async createVectorStore(name, options = {}) {
    console.log(`📁 Creando vector store "${name}"...`);

    const vectorStoreData = { name };

    if (options.expiresAfter) {
      vectorStoreData.expires_after = options.expiresAfter;
    }

    if (options.metadata) {
      vectorStoreData.metadata = options.metadata;
    }

    const vectorStore = await this.openai.vectorStores.create(vectorStoreData);

    console.log(`✅ Vector store creado: ${vectorStore.id}`);

    return {
      id: vectorStore.id,
      name: vectorStore.name,
      status: vectorStore.status,
      createdAt: vectorStore.created_at,
    };
  }

  /**
   * Obtener información de un vector store
   * @param {string} vectorStoreId - ID del vector store
   * @returns {object} - Información del vector store
   */
  async getVectorStore(vectorStoreId) {
    const vectorStore = await this.openai.vectorStores.retrieve(vectorStoreId);
    return vectorStore;
  }

  /**
   * Actualizar un vector store
   * @param {string} vectorStoreId - ID del vector store
   * @param {object} data - Datos a actualizar (name, metadata)
   * @returns {object} - Vector store actualizado
   */
  async updateVectorStore(vectorStoreId, data) {
    const vectorStore = await this.openai.vectorStores.update(
      vectorStoreId,
      data
    );
    console.log(`✅ Vector store actualizado: ${vectorStoreId}`);
    return vectorStore;
  }

  /**
   * Eliminar un vector store
   * @param {string} vectorStoreId - ID del vector store
   * @returns {object} - { success, id }
   */
  async deleteVectorStore(vectorStoreId) {
    await this.openai.vectorStores.delete(vectorStoreId);
    console.log(`✅ Vector store eliminado: ${vectorStoreId}`);
    return { success: true, id: vectorStoreId };
  }

  // ==================== ARCHIVOS ====================

  /**
   * Subir un archivo a OpenAI (sin asociarlo a vector store todavía)
   * @param {string|Buffer|Stream} file - Ruta del archivo, Buffer o Stream
   * @param {string} purpose - Propósito del archivo ('assistants', 'fine-tune', etc)
   * @returns {object} - { fileId, filename, bytes, createdAt }
   */
  async uploadFile(file, purpose = 'assistants') {
    let fileStream;

    // Si es una ruta de archivo
    if (typeof file === 'string') {
      if (!fs.existsSync(file)) {
        throw new Error(`Archivo no encontrado: ${file}`);
      }

      if (!this.isValidFileType(file)) {
        throw new Error(`Tipo de archivo no válido: ${file}`);
      }

      const stats = fs.statSync(file);
      console.log(
        `📄 Subiendo archivo: ${file} (${this.formatFileSize(stats.size)})`
      );
      fileStream = fs.createReadStream(file);
    } else {
      // Si es un Buffer o Stream
      fileStream = file;
      console.log(`📄 Subiendo archivo desde stream/buffer...`);
    }

    const uploadedFile = await this.openai.files.create({
      file: fileStream,
      purpose: purpose,
    });

    console.log(`✅ Archivo subido: ${uploadedFile.id}`);

    return {
      fileId: uploadedFile.id,
      filename: uploadedFile.filename,
      bytes: uploadedFile.bytes,
      createdAt: uploadedFile.created_at,
      purpose: uploadedFile.purpose,
    };
  }

  /**
   * Asociar un archivo ya subido a un vector store
   * @param {string} vectorStoreId - ID del vector store
   * @param {string} fileId - ID del archivo ya subido
   * @param {boolean} waitForCompletion - Si debe esperar a que se procese
   * @returns {object} - { id, vectorStoreId, status, createdAt }
   */
  async createVectorStoreFile(vectorStoreId, fileId, waitForCompletion = true) {
    console.log(
      `🔗 Asociando archivo ${fileId} al vector store ${vectorStoreId}...`
    );

    const vectorStoreFile = await this.openai.vectorStores.files.create(
      vectorStoreId,
      {
        file_id: fileId,
      }
    );

    if (waitForCompletion) {
      console.log('   ⏳ Esperando procesamiento...');
      await this.waitForFileProcessing(vectorStoreId, fileId);
      console.log(`✅ Archivo procesado y listo para usar`);
    }

    return {
      id: vectorStoreFile.id,
      vectorStoreId: vectorStoreFile.vector_store_id,
      fileId: fileId,
      status: vectorStoreFile.status,
      createdAt: vectorStoreFile.created_at,
    };
  }

  /**
   * Obtener información de un archivo en un vector store
   * @param {string} vectorStoreId - ID del vector store
   * @param {string} fileId - ID del archivo
   * @returns {object} - Información del archivo
   */
  async getVectorStoreFile(vectorStoreId, fileId) {
    const file = await this.openai.vectorStores.files.retrieve(fileId, {
      vector_store_id: vectorStoreId,
    });
    return file;
  }

  /**
   * Eliminar un archivo de un vector store (no elimina el archivo de OpenAI)
   * @param {string} vectorStoreId - ID del vector store
   * @param {string} fileId - ID del archivo
   * @returns {object} - { success, fileId }
   */
  async deleteVectorStoreFile(vectorStoreId, fileId) {
    console.log(
      `🔗 Eliminando archivo ${fileId} del vector store ${vectorStoreId}...`
    );

    const file = await this.getVectorStoreFile(vectorStoreId, fileId);
    if (!file) {
      console.log(`❌ Archivo no encontrado: ${fileId}`);
      return { success: false, fileId };
    }

    await this.openai.vectorStores.files.delete(fileId, {
      vector_store_id: vectorStoreId,
    });
    console.log(`✅ Archivo removido del vector store: ${fileId}`);
    return { success: true, fileId };
  }

  /**
   * Listar archivos de un vector store
   * @param {string} vectorStoreId - ID del vector store
   * @param {number} limit - Límite de resultados
   * @returns {array} - Lista de archivos
   */
  async listVectorStoreFiles(vectorStoreId, limit = 20) {
    const files = await this.openai.beta.vectorStores.files.list(
      vectorStoreId,
      {
        limit,
      }
    );
    return files.data;
  }

  /**
   * Obtener información de un archivo subido a OpenAI
   * @param {string} fileId - ID del archivo
   * @returns {object} - Información del archivo
   */
  async getFileInfo(fileId) {
    const file = await this.openai.files.retrieve(fileId);
    return file;
  }

  /**
   * Eliminar un archivo de OpenAI completamente
   * @param {string} fileId - ID del archivo
   * @returns {object} - { success, fileId }
   */
  async deleteFile(fileId) {
    await this.openai.files.delete(fileId);
    console.log(`✅ Archivo eliminado de OpenAI: ${fileId}`);
    return { success: true, fileId };
  }

  /**
   * Subir archivo completo (upload + asociar a vector store)
   * @deprecated Usar uploadFile y createVectorStoreFile por separado
   */
  async uploadDocument(groupId, filePath, documentId) {
    const vectorStoreId = this.workspaces.get(groupId);
    if (!vectorStoreId) {
      throw new Error(`Workspace no encontrado: ${groupId}`);
    }

    // Subir archivo
    const uploadResult = await this.uploadFile(filePath);

    // Asociar a vector store
    await this.createVectorStoreFile(vectorStoreId, uploadResult.fileId, true);

    return {
      fileId: uploadResult.fileId,
      documentId,
      filename: uploadResult.filename,
      bytes: uploadResult.bytes,
    };
  }

  // ==================== ASISTENTES ====================

  /**
   * Crear un asistente
   * @param {object} config - Configuración del asistente
   * @param {string} config.name - Nombre del asistente
   * @param {string} config.instructions - Instrucciones del asistente
   * @param {string} config.model - Modelo a usar (ej: 'gpt-4-turbo-preview')
   * @param {array} config.tools - Herramientas a usar (ej: [{ type: 'file_search' }])
   * @param {array} config.vectorStoreIds - IDs de vector stores para file_search
   * @param {object} config.metadata - Metadata adicional
   * @returns {object} - { id, name, model, instructions }
   */
  async createAssistant(config) {
    const {
      name,
      instructions,
      model = 'gpt-4-turbo-preview',
      tools = [],
      vectorStoreIds = [],
      metadata = null,
    } = config;

    console.log(`🤖 Creando asistente "${name}"...`);

    const assistantData = {
      name,
      instructions,
      model,
      tools,
    };

    // Si hay vector stores, configurar file_search
    if (vectorStoreIds.length > 0) {
      assistantData.tool_resources = {
        file_search: {
          vector_store_ids: vectorStoreIds,
        },
      };
    }

    if (metadata) {
      assistantData.metadata = metadata;
    }

    const assistant = await this.openai.beta.assistants.create(assistantData);

    console.log(`✅ Asistente creado: ${assistant.id}`);

    return {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      instructions: assistant.instructions,
      tools: assistant.tools,
    };
  }

  /**
   * Obtener información de un asistente
   * @param {string} assistantId - ID del asistente
   * @returns {object} - Información del asistente
   */
  async getAssistant(assistantId) {
    const assistant = await this.openai.beta.assistants.retrieve(assistantId);
    return assistant;
  }

  /**
   * Actualizar un asistente
   * @param {string} assistantId - ID del asistente
   * @param {object} updates - Datos a actualizar
   * @returns {object} - Asistente actualizado
   */
  async updateAssistant(assistantId, updates) {
    const assistant = await this.openai.beta.assistants.update(
      assistantId,
      updates
    );
    console.log(`✅ Asistente actualizado: ${assistantId}`);
    return assistant;
  }

  /**
   * Eliminar un asistente
   * @param {string} assistantId - ID del asistente
   * @returns {object} - { success, id }
   */
  async deleteAssistant(assistantId) {
    await this.openai.beta.assistants.del(assistantId);
    console.log(`✅ Asistente eliminado: ${assistantId}`);
    return { success: true, id: assistantId };
  }

  /**
   * Listar asistentes
   * @param {number} limit - Límite de resultados
   * @returns {array} - Lista de asistentes
   */
  async listAssistants(limit = 20) {
    const assistants = await this.openai.beta.assistants.list({ limit });
    return assistants.data;
  }

  /**
   * Asignar vector stores a un asistente (reemplaza los existentes)
   * @param {string} assistantId - ID del asistente
   * @param {array} vectorStoreIds - Array de IDs de vector stores
   * @returns {object} - Asistente actualizado
   */
  async assignVectorStoresToAssistant(assistantId, vectorStoreIds) {
    console.log(
      `🔗 Asignando ${vectorStoreIds.length} vector stores al asistente ${assistantId}...`
    );

    const assistant = await this.openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: {
          vector_store_ids: vectorStoreIds,
        },
      },
    });

    console.log(`✅ Vector stores asignados exitosamente`);

    return assistant;
  }

  /**
   * Agregar un vector store a un asistente (mantiene los existentes)
   * @param {string} assistantId - ID del asistente
   * @param {string} vectorStoreId - ID del vector store a agregar
   * @returns {object} - Asistente actualizado
   */
  async addVectorStoreToAssistant(assistantId, vectorStoreId) {
    console.log(
      `➕ Agregando vector store ${vectorStoreId} al asistente ${assistantId}...`
    );

    // Primero obtenemos el asistente actual
    const currentAssistant = await this.getAssistant(assistantId);

    // Obtenemos los vector stores actuales
    const currentVectorStores =
      currentAssistant.tool_resources &&
      currentAssistant.tool_resources.file_search &&
      currentAssistant.tool_resources.file_search.vector_store_ids
        ? currentAssistant.tool_resources.file_search.vector_store_ids
        : [];

    // Verificamos si ya existe
    if (currentVectorStores.includes(vectorStoreId)) {
      console.log(`⚠️  El vector store ya está asignado al asistente`);
      return currentAssistant;
    }

    // Agregamos el nuevo vector store
    const updatedVectorStores = [...currentVectorStores, vectorStoreId];

    const assistant = await this.assignVectorStoresToAssistant(
      assistantId,
      updatedVectorStores
    );

    return assistant;
  }

  /**
   * Remover un vector store de un asistente
   * @param {string} assistantId - ID del asistente
   * @param {string} vectorStoreId - ID del vector store a remover
   * @returns {object} - Asistente actualizado
   */
  async removeVectorStoreFromAssistant(assistantId, vectorStoreId) {
    console.log(
      `➖ Removiendo vector store ${vectorStoreId} del asistente ${assistantId}...`
    );

    // Primero obtenemos el asistente actual
    const currentAssistant = await this.getAssistant(assistantId);

    // Obtenemos los vector stores actuales
    const currentVectorStores =
      currentAssistant.tool_resources &&
      currentAssistant.tool_resources.file_search &&
      currentAssistant.tool_resources.file_search.vector_store_ids
        ? currentAssistant.tool_resources.file_search.vector_store_ids
        : [];

    // Filtramos el vector store a remover
    const updatedVectorStores = currentVectorStores.filter(
      (id) => id !== vectorStoreId
    );

    if (currentVectorStores.length === updatedVectorStores.length) {
      console.log(`⚠️  El vector store no estaba asignado al asistente`);
      return currentAssistant;
    }

    const assistant = await this.assignVectorStoresToAssistant(
      assistantId,
      updatedVectorStores
    );

    console.log(`✅ Vector store removido exitosamente`);

    return assistant;
  }

  /**
   * Obtener los vector stores asignados a un asistente
   * @param {string} assistantId - ID del asistente
   * @returns {array} - Array de IDs de vector stores
   */
  async getAssistantVectorStores(assistantId) {
    const assistant = await this.getAssistant(assistantId);
    return assistant.tool_resources &&
      assistant.tool_resources.file_search &&
      assistant.tool_resources.file_search.vector_store_ids
      ? assistant.tool_resources.file_search.vector_store_ids
      : [];
  }

  /**
   * Hacer pregunta a un asistente directamente usando IDs
   * @param {string} assistantId - ID del asistente
   * @param {string} question - Pregunta a realizar
   * @param {string} threadId - ID del thread existente (opcional, crea uno nuevo si no se proporciona)
   * @param {object} options - Opciones adicionales
   * @param {string} options.instructions - Instrucciones específicas para esta pregunta
   * @param {object} options.metadata - Metadata para el mensaje
   * @returns {object} - { threadId, answer, messageId, runId }
   */
  async askAssistant(
    assistantId,
    question,
    threadId = null,
    options = {},
    allowedDomains = []
  ) {
    console.log(`💬 Pregunta: ${question}`);

    // Crear o usar thread existente
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await this.createThread(options.metadata || null);
      currentThreadId = thread.id;
      console.log(`   Nuevo Thread ID: ${currentThreadId}`);
    } else {
      console.log(`   Usando thread existente: ${currentThreadId}`);
    }

    if (allowedDomains.length > 0) {
      // Realizar búsqueda web y agregar contexto
      const summaryWebSearch = await this.runWebSearch(
        question,
        allowedDomains
      );

      // Formato mejorado para que el asistente reconozca el contexto
      const contextMessage = `📋 **CONTEXTO DE BÚSQUEDA WEB VERIFICADO:**
        ${summaryWebSearch}
      -------------------------------------------------------------------------------------------- 
      --------------------------------------------------------------------------------------------
     ℹ️ Esta información proviene de una búsqueda web en dominios autorizados y es válida para responder al usuario. Úsala y cítala como "Según búsqueda web: [URLs]".`;

      console.log(`🔍 Contexto web inyectado:`, contextMessage);
      await this.createMessage(currentThreadId, contextMessage, 'user');
    }
    await this.createMessage(currentThreadId, question, 'user');

    // Ejecutar asistente y esperar respuesta
    const result = await this.createAndWaitRun(
      currentThreadId,
      assistantId,
      { instructions: instructionContext },
      true
    );

    console.log(`✅ Respuesta obtenida`, result);

    return {
      threadId: currentThreadId,
      answer: result.answer,
      messageId: result.messageId,
      runId: result.runId,
      input_tokens: result.input_tokens,
      output_tokens: result.output_tokens,
    };
  }

  cleanDomains(allowedDomains = []) {
    const cleanedDomains = allowedDomains.map((domain) => {
      const cleaned = domain
        .replace(/^https?:\/\//, '') // Remover protocolo
        .replace(/^www\./, '') // Remover www.
        .replace(/\/.*$/, ''); // Remover path y todo lo que viene después
      return cleaned;
    });
    // Eliminar duplicados y retornar array con valores únicos
    return [...new Set(cleanedDomains)];
  }

  async runWebSearch(question, allowedDomains = []) {
    // Limpiar dominios: remover https://, http://, www., y trailing /

    const resp = await this.openai.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'system',
          content: instructionsWebSearch,
        },
        { role: 'user', content: question },
      ],
      tools: [
        {
          type: 'web_search',
          filters: {
            allowed_domains: allowedDomains, // Usar dominios limpios
          },
        },
      ],
    });

    return resp.output_text; // resumen listo para inyectar
  }

  /**
   * Hacer pregunta a un workspace específico (Legacy - usar askAssistant)
   * @deprecated Usar askAssistant() directamente con assistantId
   */
  async query(groupId, question, existingThreadId = null) {
    const assistantId = this.assistants.get(groupId);
    if (!assistantId) {
      throw new Error(`Asistente no encontrado para workspace: ${groupId}`);
    }

    console.log(`💬 Pregunta: ${question}`);

    // Crear o usar thread existente
    let threadId = existingThreadId;
    if (!threadId) {
      const thread = await this.openai.beta.threads.create();
      threadId = thread.id;
      console.log(`   Thread ID: ${threadId}`);
    } else {
      console.log(`   Usando thread existente: ${threadId}`);
    }

    // Añadir mensaje
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: question,
    });

    // Ejecutar asistente
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Esperar respuesta
    console.log('   ⏳ Esperando respuesta...');
    await this.waitForRunCompletion(threadId, run.id);

    // Obtener respuesta
    const messages = await this.openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];
    const answer = lastMessage.content[0].text.value;

    console.log(`\n🤖 Respuesta: ${answer}\n`);

    return {
      threadId,
      answer,
      messageId: lastMessage.id,
    };
  }

  /**
   * Obtener información detallada de un workspace
   */
  async getWorkspaceInfo(groupId) {
    const vectorStoreId = this.workspaces.get(groupId);
    if (!vectorStoreId) {
      throw new Error(`Workspace no encontrado: ${groupId}`);
    }

    return await this.getVectorStoreInfo(vectorStoreId);
  }

  /**
   * Obtener resumen del asistente de un workspace
   */
  async getAssistantInfo(groupId) {
    const assistantId = this.assistants.get(groupId);
    if (!assistantId) {
      throw new Error(`Asistente no encontrado para workspace: ${groupId}`);
    }

    return await this.getAssistantSummary(assistantId);
  }

  /**
   * Obtener historial de conversación
   */
  async getConversationHistory(threadId) {
    const messages = await this.openai.beta.threads.messages.list(threadId);
    return this.formatMessages(messages.data);
  }

  // ==================== GESTIÓN DE THREADS ====================

  /**
   * Crear un nuevo thread (conversación)
   */
  async createThread(metadata = null) {
    const options = {};
    if (metadata) {
      options.metadata = metadata;
    }

    const thread = await this.openai.beta.threads.create(options);
    console.log(`🧵 Thread creado: ${thread.id}`);

    return {
      id: thread.id,
      createdAt: thread.created_at,
      metadata: thread.metadata,
    };
  }

  /**
   * Agregar un mensaje a un thread
   */
  async addMessageToThread(threadId, content, role = 'user', fileIds = null) {
    const messageData = {
      role,
      content,
    };

    if (fileIds && fileIds.length > 0) {
      messageData.file_ids = fileIds;
    }

    const message = await this.openai.beta.threads.messages.create(
      threadId,
      messageData
    );

    return {
      messageId: message.id,
      threadId,
      role: message.role,
      content: message.content[0].text.value,
      createdAt: message.created_at,
    };
  }

  /**
   * Ejecutar un thread con un asistente específico
   */
  async runThread(threadId, assistantId, instructions = null) {
    const runData = {
      assistant_id: assistantId,
    };

    if (instructions) {
      runData.instructions = instructions;
    }

    console.log(
      `🏃 Ejecutando thread ${threadId} con asistente ${assistantId}...`
    );

    const run = await this.openai.beta.threads.runs.create(threadId, runData);

    // Esperar a que complete
    await this.waitForRunCompletion(threadId, run.id);

    // Obtener la última respuesta
    const messages = await this.openai.beta.threads.messages.list(threadId, {
      limit: 1,
      order: 'desc',
    });

    const lastMessage = messages.data[0];
    const content =
      lastMessage.content &&
      lastMessage.content[0] &&
      lastMessage.content[0].text
        ? lastMessage.content[0].text.value
        : '';

    console.log(`✅ Thread ejecutado exitosamente`);

    return {
      runId: run.id,
      threadId,
      messageId: lastMessage.id,
      answer: content,
    };
  }

  /**
   * Obtener mensajes de un thread
   */
  async getThreadMessages(threadId, limit = 20) {
    const messages = await this.openai.beta.threads.messages.list(threadId, {
      limit,
      order: 'desc',
    });

    return this.formatMessages(messages.data);
  }

  /**
   * Eliminar un thread
   */
  async deleteThread(threadId) {
    await this.openai.beta.threads.del(threadId);
    console.log(`✅ Thread eliminado: ${threadId}`);

    return { success: true, threadId };
  }

  /**
   * Obtener información de un thread
   */
  async getThreadInfo(threadId) {
    const thread = await this.openai.beta.threads.retrieve(threadId);

    return {
      id: thread.id,
      createdAt: new Date(thread.created_at * 1000).toISOString(),
      metadata: thread.metadata,
    };
  }

  /**
   * Modificar metadata de un thread
   */
  async updateThreadMetadata(threadId, metadata) {
    const thread = await this.openai.beta.threads.update(threadId, {
      metadata,
    });

    console.log(`✅ Thread actualizado: ${threadId}`);

    return {
      id: thread.id,
      metadata: thread.metadata,
    };
  }

  // ==================== MENSAJES ====================

  /**
   * Crear un mensaje en un thread
   * @param {string} threadId - ID del thread
   * @param {string} content - Contenido del mensaje
   * @param {string} role - Rol ('user' o 'assistant')
   * @param {array} fileIds - IDs de archivos adjuntos
   * @param {object} metadata - Metadata adicional
   * @returns {object} - { id, threadId, role, content, createdAt }
   */
  async createMessage(
    threadId,
    content,
    role = 'user',
    fileIds = null,
    metadata = null
  ) {
    const messageData = {
      role,
      content,
    };

    if (fileIds && fileIds.length > 0) {
      messageData.file_ids = fileIds;
    }

    if (metadata) {
      messageData.metadata = metadata;
    }

    const message = await this.openai.beta.threads.messages.create(
      threadId,
      messageData
    );

    const messageContent =
      message.content && message.content[0] && message.content[0].text
        ? message.content[0].text.value
        : content;

    return {
      id: message.id,
      threadId,
      role: message.role,
      content: messageContent,
      createdAt: message.created_at,
    };
  }

  /**
   * Obtener un mensaje específico
   * @param {string} threadId - ID del thread
   * @param {string} messageId - ID del mensaje
   * @returns {object} - Información del mensaje
   */
  async getMessage(threadId, messageId) {
    const message = await this.openai.beta.threads.messages.retrieve(
      threadId,
      messageId
    );
    return message;
  }

  /**
   * Listar mensajes de un thread
   * @param {string} threadId - ID del thread
   * @param {object} options - Opciones (limit, order, after, before)
   * @returns {array} - Lista de mensajes
   */
  async listMessages(threadId, options = {}) {
    const { limit = 20, order = 'desc', after = null, before = null } = options;

    const queryParams = { limit, order };
    if (after) queryParams.after = after;
    if (before) queryParams.before = before;

    const messages = await this.openai.beta.threads.messages.list(
      threadId,
      queryParams
    );

    return messages.data;
  }

  /**
   * Actualizar un mensaje
   * @param {string} threadId - ID del thread
   * @param {string} messageId - ID del mensaje
   * @param {object} metadata - Metadata a actualizar
   * @returns {object} - Mensaje actualizado
   */
  async updateMessage(threadId, messageId, metadata) {
    const message = await this.openai.beta.threads.messages.update(
      threadId,
      messageId,
      { metadata }
    );
    console.log(`✅ Mensaje actualizado: ${messageId}`);
    return message;
  }

  // ==================== RUNS ====================

  /**
   * Crear y ejecutar un run
   * @param {string} threadId - ID del thread
   * @param {string} assistantId - ID del asistente
   * @param {object} options - Opciones adicionales
   * @returns {object} - { id, status, threadId, assistantId }
   */
  async createRun(threadId, assistantId, options = {}) {
    const {
      instructions = null,
      model = null,
      tools = null,
      metadata = null,
    } = options;

    const runData = {
      assistant_id: assistantId,
    };

    if (instructions) runData.instructions = instructions;
    if (model) runData.model = model;
    if (tools) runData.tools = tools;
    if (metadata) runData.metadata = metadata;

    console.log(`🏃 Creando run en thread ${threadId}...`);

    const run = await this.openai.beta.threads.runs.create(threadId, runData);

    return {
      id: run.id,
      status: run.status,
      threadId: run.thread_id,
      assistantId: run.assistant_id,
      createdAt: run.created_at,
    };
  }

  /**
   * Obtener información de un run
   * @param {string} threadId - ID del thread
   * @param {string} runId - ID del run
   * @returns {object} - Información del run
   */
  async getRun(threadId, runId) {
    const run = await this.openai.beta.threads.runs.retrieve(runId, {
      thread_id: threadId,
    });
    return run;
  }

  /**
   * Listar runs de un thread
   * @param {string} threadId - ID del thread
   * @param {number} limit - Límite de resultados
   * @returns {array} - Lista de runs
   */
  async listRuns(threadId, limit = 20) {
    const runs = await this.openai.beta.threads.runs.list(threadId, { limit });
    return runs.data;
  }

  /**
   * Cancelar un run en ejecución
   * @param {string} threadId - ID del thread
   * @param {string} runId - ID del run
   * @returns {object} - { success, id, status }
   */
  async cancelRun(threadId, runId) {
    const run = await this.openai.beta.threads.runs.cancel(runId, {
      thread_id: threadId,
    });
    console.log(`✅ Run cancelado: ${runId}`);
    return {
      success: true,
      id: run.id,
      status: run.status,
    };
  }

  /**
   * Crear un run y esperar su completación
   * @param {string} threadId - ID del thread
   * @param {string} assistantId - ID del asistente
   * @param {object} options - Opciones adicionales
   * @param {boolean} waitForCompletion - Si debe esperar a que complete
   * @returns {object} - { runId, status, answer, messageId }
   */
  async createAndWaitRun(
    threadId,
    assistantId,
    options = {},
    waitForCompletion = true
  ) {
    const run = await this.createRun(threadId, assistantId, options);

    if (waitForCompletion) {
      console.log('   ⏳ Esperando completación...');
      await this.waitForRunCompletion(threadId, run.id);

      // Obtener la última respuesta
      const messages = await this.listMessages(threadId, { limit: 1 });
      const lastMessage = messages[0];

      const content =
        lastMessage.content &&
        lastMessage.content[0] &&
        lastMessage.content[0].text
          ? lastMessage.content[0].text.value
          : '';

      console.log(`✅ Run completado exitosamente`);

      return {
        runId: run.id,
        status: 'completed',
        threadId,
        answer: content,
        messageId: lastMessage.id,
      };
    }

    return {
      runId: run.id,
      status: run.status,
      threadId,
    };
  }

  // ==================== GESTIÓN DE DOCUMENTOS ====================

  /**
   * Eliminar un archivo de un workspace
   */
  async deleteDocument(groupId, fileId) {
    const vectorStoreId = this.workspaces.get(groupId);
    if (!vectorStoreId) {
      throw new Error(`Workspace no encontrado: ${groupId}`);
    }

    await this.openai.beta.vectorStores.files.del(vectorStoreId, fileId);
    console.log(`✅ Archivo eliminado: ${fileId}`);

    return { success: true, fileId };
  }

  /**
   * Listar archivos de un workspace
   */
  async listDocuments(groupId) {
    const vectorStoreId = this.workspaces.get(groupId);
    if (!vectorStoreId) {
      throw new Error(`Workspace no encontrado: ${groupId}`);
    }

    const files = await this.openai.beta.vectorStores.files.list(vectorStoreId);
    return files.data;
  }

  /**
   * Cargar workspaces y asistentes existentes
   */
  loadWorkspace(groupId, vectorStoreId, assistantId = null) {
    this.workspaces.set(groupId, vectorStoreId);
    if (assistantId) {
      this.assistants.set(groupId, assistantId);
    }
  }

  /**
   * Obtener el vectorStoreId de un workspace
   */
  getVectorStoreId(groupId) {
    return this.workspaces.get(groupId);
  }

  /**
   * Obtener el assistantId de un workspace
   */
  getAssistantId(groupId) {
    return this.assistants.get(groupId);
  }

  // ==================== UTILIDADES ====================

  /**
   * Esperar a que un run se complete
   */
  async waitForRunCompletion(threadId, runId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const run = await this.openai.beta.threads.runs.retrieve(runId, {
        thread_id: threadId,
      });

      if (run.status === 'completed') {
        return run;
      }

      if (
        run.status === 'failed' ||
        run.status === 'cancelled' ||
        run.status === 'expired'
      ) {
        const errorMessage =
          run.last_error && run.last_error.message
            ? run.last_error.message
            : 'Unknown error';
        throw new Error(`Run ${run.status}: ${errorMessage}`);
      }

      await this.sleep(1000);
    }

    throw new Error('Timeout esperando completar el run');
  }

  /**
   * Esperar a que un archivo se procese en el vector store
   */
  async waitForFileProcessing(vectorStoreId, fileId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const file = await this.openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        fileId
      );

      if (file.status === 'completed') {
        return file;
      }

      if (file.status === 'failed' || file.status === 'cancelled') {
        throw new Error(`File processing ${file.status}`);
      }

      await this.sleep(1000);
    }

    throw new Error('Timeout esperando procesar el archivo');
  }

  /**
   * Obtener información de un vector store
   */
  async getVectorStoreInfo(vectorStoreId) {
    return await this.openai.beta.vectorStores.retrieve(vectorStoreId);
  }

  /**
   * Obtener resumen de un asistente
   */
  async getAssistantSummary(assistantId) {
    return await this.openai.beta.assistants.retrieve(assistantId);
  }

  /**
   * Formatear mensajes para visualización
   */
  formatMessages(messages) {
    return messages.map((msg) => {
      const content =
        msg.content && msg.content[0] && msg.content[0].text
          ? msg.content[0].text.value
          : '';
      return {
        role: msg.role,
        content: content,
        createdAt: new Date(msg.created_at * 1000).toISOString(),
      };
    });
  }

  /**
   * Validar tipo de archivo
   */
  isValidFileType(filePath) {
    const validExtensions = [
      '.txt',
      '.pdf',
      '.doc',
      '.docx',
      '.md',
      '.json',
      '.csv',
      '.html',
    ];
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    return validExtensions.includes(ext);
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==================== STREAMING & RESPONSES ====================

  /**
   * Hacer pregunta al asistente con streaming (respuesta en tiempo real)
   * @param {string} assistantId - ID del asistente
   * @param {string} question - Pregunta a realizar
   * @param {string} threadId - ID del thread existente (opcional)
   * @param {function} onChunk - Callback que recibe cada chunk de texto: (text) => {}
   * @param {function} onComplete - Callback al completar: (fullText) => {}
   * @param {object} options - Opciones adicionales
   * @returns {object} - { threadId, fullAnswer, messageId, runId }
   */
  async askAssistantStream(
    assistantId,
    question,
    threadId = null,
    onChunk = null,
    onComplete = null,
    options = {}
  ) {
    console.log(`💬 Pregunta (streaming): ${question}`);

    // Crear o usar thread existente
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await this.createThread(options.metadata || null);
      currentThreadId = thread.id;
      console.log(`   Nuevo Thread ID: ${currentThreadId}`);
    } else {
      console.log(`   Usando thread existente: ${currentThreadId}`);
    }

    // Añadir mensaje del usuario
    await this.createMessage(currentThreadId, question, 'user');

    // Crear run con streaming
    const runData = {
      assistant_id: assistantId,
    };

    if (options.instructions) {
      runData.instructions = options.instructions;
    }

    console.log('🏃 Iniciando run con streaming...');

    const stream = this.openai.beta.threads.runs.stream(
      currentThreadId,
      runData
    );

    let fullText = '';
    let lastMessageId = null;
    let runId = null;
    let streamError = null;
    let runStatus = 'starting';

    // Evento: Thread creado o run iniciado
    stream.on('threadCreated', (thread) => {
      console.log('🧵 Thread creado por OpenAI:', thread.id);
    });

    stream.on('runCreated', (run) => {
      runStatus = 'created';
      console.log('🏃 Run creado por OpenAI:', run.id, '- Status:', run.status);
    });

    // Evento: Cambios en el run
    stream.on('runInProgress', (run) => {
      runStatus = 'in_progress';
      console.log('⏳ Run en progreso:', run.id);
    });

    stream.on('runCompleted', (run) => {
      runStatus = 'completed';
      console.log('✅ Run completado por OpenAI:', run.id);
    });

    stream.on('runFailed', (run) => {
      runStatus = 'failed';
      console.log('❌ Run falló en OpenAI:', run.id);
      console.log(
        '   Razón:',
        run.last_error.message || 'Desconocida',
        run.last_error
      );
      streamError = new Error(
        `OpenAI Run Failed: ${run.last_error.message || 'Unknown'}`
      );
    });

    stream.on('runCancelled', (run) => {
      runStatus = 'cancelled';
      console.log('⏹️  Run cancelado en OpenAI:', run.id);
    });

    stream.on('runExpired', (run) => {
      runStatus = 'expired';
      console.log('⏱️  Run expirado en OpenAI:', run.id);
    });

    // Manejar eventos del stream
    stream.on('textDelta', (textDelta) => {
      const chunk = textDelta.value;
      fullText += chunk;
      if (onChunk) {
        try {
          onChunk(chunk);
        } catch (err) {
          console.error('Error en onChunk callback:', err.message);
        }
      }
    });

    stream.on('messageDone', (message) => {
      lastMessageId = message.id;
      console.log('💬 Mensaje completado:', message.id);
    });

    stream.on('runStepDone', (runStep) => {
      runId = runStep.run_id;
      console.log('📝 Run step completado:', runStep.type);
    });

    // Eventos de herramientas (file_search, etc)
    stream.on('toolCallCreated', (toolCall) => {
      console.log('🔧 Herramienta activada:', toolCall.type);
    });

    stream.on('toolCallDone', (toolCall) => {
      console.log('✅ Herramienta completada:', toolCall.type);
    });

    // Manejar errores del stream
    stream.on('error', (error) => {
      streamError = error;

      console.log('\n🚨 ======= ERROR EN STREAM =======');
      console.log('Tipo de error:', error.constructor.name);
      console.log('Mensaje:', error.message);
      console.log('Código:', error.code || 'N/A');

      // Categorizar el tipo de error
      if (error.message && error.message.includes('terminated')) {
        console.log(
          '📍 Origen: CONEXIÓN - Cliente cerró la conexión o timeout de red'
        );
      } else if (error.status) {
        console.log(`📍 Origen: OPENAI API - HTTP ${error.status}`);
        console.log('Detalle:', error.error || error.message);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('📍 Origen: RED - No se puede conectar a OpenAI');
      } else if (error.type === 'invalid_request_error') {
        console.log('📍 Origen: OPENAI - Solicitud inválida');
      } else if (error.type === 'authentication_error') {
        console.log(
          '📍 Origen: OPENAI - Error de autenticación (API Key inválida)'
        );
      } else if (error.type === 'rate_limit_error') {
        console.log('📍 Origen: OPENAI - Rate limit excedido');
      } else if (
        error.type === 'server_error' ||
        error.type === 'service_unavailable'
      ) {
        console.log('📍 Origen: OPENAI - Servidor no disponible');
      } else {
        console.log('📍 Origen: DESCONOCIDO');
      }

      console.log('================================\n');
    });

    // Esperar a que el stream complete usando done()
    try {
      await stream.done();
      console.log('✅ ======= STREAMING COMPLETADO EXITOSAMENTE =======');
      console.log(`   Caracteres recibidos: ${fullText.length}`);
      console.log(`   Thread ID: ${currentThreadId}`);
      console.log(`   Message ID: ${lastMessageId}`);
      console.log(`   Run ID: ${runId}`);
      console.log('====================================================\n');
    } catch (error) {
      console.log('\n⚠️  ======= STREAM TERMINADO CON ERROR =======');
      console.log('Tipo:', error.constructor.name);
      console.log('Mensaje:', error.message);

      // Categorizar el error
      if (error.message && error.message.includes('terminated')) {
        console.log('📍 Causa: CONEXIÓN - Stream terminado prematuramente');
        console.log('   Posibles razones:');
        console.log('   - Cliente cerró la conexión');
        console.log('   - Timeout de red');
        console.log('   - Proxy/firewall interrumpió la conexión');
        streamError = error;
      } else if (error.status) {
        console.log(`📍 Causa: OPENAI API ERROR - HTTP ${error.status}`);
        console.log('   Error de OpenAI:', error.error || error.message);
        streamError = error;
        throw error;
      } else {
        console.log('📍 Causa: ERROR DESCONOCIDO');
        console.log('   Stack:', error.stack);
        streamError = error;
        throw error;
      }

      console.log('============================================\n');
    }

    // Ejecutar onComplete siempre
    console.log('\n📊 ======= RESUMEN DEL STREAM =======');
    console.log('Run Status Final:', runStatus);
    console.log('Texto recibido:', fullText.length, 'caracteres');
    console.log('Error presente:', streamError ? 'SÍ' : 'NO');
    if (streamError) {
      console.log('Tipo de error:', streamError.constructor.name);
      console.log('Mensaje:', streamError.message);
    }
    console.log('=====================================\n');

    if (onComplete) {
      try {
        console.log(
          `🎯 Ejecutando onComplete con ${fullText.length} caracteres`
        );
        onComplete(fullText);
      } catch (err) {
        console.error('Error en onComplete callback:', err.message);
      }
    } else {
      console.log('⚠️  No hay callback onComplete definido');
    }

    return {
      threadId: currentThreadId,
      fullAnswer: fullText,
      messageId: lastMessageId,
      runId: runId,
      runStatus: runStatus,
      error: streamError,
      errorType: streamError
        ? streamError.type || streamError.constructor.name
        : null,
    };
  }

  /**
   * Hacer pregunta al asistente con streaming (async iterator)
   * @param {string} assistantId - ID del asistente
   * @param {string} question - Pregunta a realizar
   * @param {string} threadId - ID del thread existente (opcional)
   * @param {object} options - Opciones adicionales
   * @returns {AsyncGenerator} - Async iterator que yield cada chunk
   */
  async *askAssistantStreamIterator(
    assistantId,
    question,
    threadId = null,
    options = {}
  ) {
    console.log(`💬 Pregunta (streaming iterator): ${question}`);

    // Crear o usar thread existente
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await this.createThread(options.metadata || null);
      currentThreadId = thread.id;
      console.log(`   Nuevo Thread ID: ${currentThreadId}`);
    } else {
      console.log(`   Usando thread existente: ${currentThreadId}`);
    }

    // Añadir mensaje del usuario
    await this.createMessage(currentThreadId, question, 'user');

    // Crear run con streaming
    const runData = {
      assistant_id: assistantId,
    };

    if (options.instructions) {
      runData.instructions = options.instructions;
    }

    console.log('🏃 Iniciando run con streaming iterator...');

    const stream = this.openai.beta.threads.runs.stream(
      currentThreadId,
      runData
    );

    let fullText = '';
    let lastMessageId = null;
    let runId = null;

    // Crear promesa para cada evento
    const chunks = [];
    let resolveNext = null;
    let streamEnded = false;

    stream.on('textDelta', (textDelta) => {
      const chunk = textDelta.value;
      fullText += chunk;

      if (resolveNext) {
        resolveNext({ value: chunk, done: false });
        resolveNext = null;
      } else {
        chunks.push(chunk);
      }
    });

    stream.on('messageDone', (message) => {
      lastMessageId = message.id;
    });

    stream.on('runStepDone', (runStep) => {
      runId = runStep.run_id;
    });

    stream.on('end', () => {
      streamEnded = true;
      if (resolveNext) {
        resolveNext({ done: true });
        resolveNext = null;
      }
    });

    // Esperar el stream en background
    stream.done().catch((err) => {
      console.error('Error en stream:', err);
    });

    // Yield cada chunk
    while (!streamEnded || chunks.length > 0) {
      if (chunks.length > 0) {
        yield chunks.shift();
      } else if (!streamEnded) {
        const nextChunk = await new Promise((resolve) => {
          resolveNext = resolve;
          setTimeout(() => {
            if (resolveNext === resolve) {
              resolve({ value: null, done: streamEnded });
              resolveNext = null;
            }
          }, 100);
        });

        if (nextChunk.done) break;
        if (nextChunk.value) yield nextChunk.value;
      }
    }

    console.log('✅ Streaming iterator completado');

    // Retornar metadata final
    return {
      threadId: currentThreadId,
      fullAnswer: fullText,
      messageId: lastMessageId,
      runId: runId,
    };
  }

  /**
   * Chat completion con streaming (sin asistente, directo).
   * Permite añadir varios vectorStoreIds utilizando options.vectorStoreIds (si el modelo/endpoint lo soporta).
   * @param {string} prompt - Pregunta o prompt
   * @param {function} onChunk - Callback para cada chunk: (text) => {}
   * @param {function} onComplete - Callback al completar: (fullText) => {}
   * @param {object} options - Opciones (model, temperature, max_tokens, vectorStoreIds, etc)
   *    - options.vectorStoreIds: array de IDs de vector store para el contexto (si aplica)
   * @returns {object} - { fullText, usage }
   */
  async chatCompletionStream(
    prompt,
    onChunk = null,
    onComplete = null,
    options = {}
  ) {
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 1,
      max_tokens = null,
      systemMessage = null,
      vectorStoreIds = [],
    } = options;

    const messages = [];

    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }

    messages.push({ role: 'user', content: prompt });

    console.log('💬 Iniciando chat completion con streaming...');

    const stream = await this.openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
      tools:
        vectorStoreIds.length > 0
          ? [{ type: 'file_search', vector_store_ids: vectorStoreIds }]
          : [],
    });

    let fullText = '';

    for await (const chunk of stream) {
      const content =
        chunk.choices &&
        chunk.choices[0] &&
        chunk.choices[0].delta &&
        chunk.choices[0].delta.content
          ? chunk.choices[0].delta.content
          : '';
      if (content) {
        fullText += content;
        if (onChunk) {
          onChunk(content);
        }
      }
    }

    console.log('✅ Chat completion completado');

    if (onComplete) {
      onComplete(fullText);
    }

    return {
      fullText,
      model,
    };
  }

  /**
   * Crear run con event handlers personalizados
   * @param {string} threadId - ID del thread
   * @param {string} assistantId - ID del asistente
   * @param {object} eventHandlers - Objeto con callbacks para diferentes eventos
   * @param {object} options - Opciones adicionales
   * @returns {object} - { threadId, answer, messageId, runId }
   */
  async createRunWithEvents(
    threadId,
    assistantId,
    eventHandlers = {},
    options = {}
  ) {
    const {
      onTextCreated = null,
      onTextDelta = null,
      onTextDone = null,
      onToolCallCreated = null,
      onToolCallDelta = null,
      onToolCallDone = null,
      onMessageCreated = null,
      onMessageDone = null,
      onRunStepCreated = null,
      onRunStepDone = null,
      onEnd = null,
      onError = null,
    } = eventHandlers;

    const runData = {
      assistant_id: assistantId,
    };

    if (options.instructions) {
      runData.instructions = options.instructions;
    }

    console.log('🏃 Iniciando run con event handlers...');

    const stream = this.openai.beta.threads.runs.stream(threadId, runData);

    let fullText = '';
    let lastMessageId = null;
    let runId = null;

    // Text events
    if (onTextCreated) {
      stream.on('textCreated', onTextCreated);
    }

    if (onTextDelta) {
      stream.on('textDelta', (textDelta) => {
        fullText += textDelta.value;
        onTextDelta(textDelta);
      });
    } else {
      // Por defecto, acumular texto
      stream.on('textDelta', (textDelta) => {
        fullText += textDelta.value;
      });
    }

    if (onTextDone) {
      stream.on('textDone', onTextDone);
    }

    // Tool call events
    if (onToolCallCreated) {
      stream.on('toolCallCreated', onToolCallCreated);
    }

    if (onToolCallDelta) {
      stream.on('toolCallDelta', onToolCallDelta);
    }

    if (onToolCallDone) {
      stream.on('toolCallDone', onToolCallDone);
    }

    // Message events
    if (onMessageCreated) {
      stream.on('messageCreated', onMessageCreated);
    }

    if (onMessageDone) {
      stream.on('messageDone', (message) => {
        lastMessageId = message.id;
        if (onMessageDone) onMessageDone(message);
      });
    } else {
      stream.on('messageDone', (message) => {
        lastMessageId = message.id;
      });
    }

    // Run step events
    if (onRunStepCreated) {
      stream.on('runStepCreated', onRunStepCreated);
    }

    if (onRunStepDone) {
      stream.on('runStepDone', (runStep) => {
        runId = runStep.run_id;
        if (onRunStepDone) onRunStepDone(runStep);
      });
    } else {
      stream.on('runStepDone', (runStep) => {
        runId = runStep.run_id;
      });
    }

    // End and error events
    if (onEnd) {
      stream.on('end', onEnd);
    }

    if (onError) {
      stream.on('error', onError);
    }

    // Esperar a que complete usando done()
    await stream.done();

    console.log('✅ Run con eventos completado');

    return {
      threadId,
      answer: fullText,
      messageId: lastMessageId,
      runId: runId,
    };
  }

  /**
   * Chat completion simple sin streaming (respuesta directa)
   * @param {string} prompt - Pregunta o prompt
   * @param {object} options - Opciones (model, temperature, max_tokens, systemMessage)
   * @returns {object} - { text, usage, model }
   */
  async chatCompletion(prompt, options = {}) {
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 1,
      max_tokens = null,
      systemMessage = null,
    } = options;

    const messages = [];

    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }

    messages.push({ role: 'user', content: prompt });

    console.log('💬 Enviando chat completion...');

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    const text = response.choices[0].message.content;
    const usage = response.usage;

    console.log('✅ Chat completion completado');

    return {
      text,
      usage,
      model,
    };
  }

  // ==================== RESPONSES API (Nuevo sistema directo) ====================

  /**
   * Crear respuesta usando la API de Responses (más simple que Assistants)
   * @param {string} input - Pregunta del usuario
   * @param {object} config - Configuración
   * @param {string} config.model - Modelo a usar
   * @param {string} config.instructions - Instrucciones para el asistente
   * @param {array} config.vectorStoreIds - IDs de vector stores para búsqueda
   * @param {number} config.maxNumResults - Máximo de resultados de búsqueda
   * @param {boolean} config.includeSearchResults - Incluir resultados de búsqueda
   * @param {object} config.metadata - Metadata adicional
   * @returns {object} - { output, searchResults, usage }
   */
  async createResponse(input, config = {}) {
    const {
      model = 'gpt-4.1',
      instructions = 'Eres un asistente útil.',
      vectorStoreIds = [],
      maxNumResults = 3,
      metadata = null,
      temperature = 1,
      allowedDomains = [],
    } = config;

    console.log('🚀 Creando respuesta con Responses API...');

    const requestData = {
      model,
      input,
      instructions,
      temperature,
      tool_choice: 'auto',
    };

    // Configurar herramientas si hay vector stores
    if (vectorStoreIds.length > 0) {
      requestData.tools = [
        {
          type: 'file_search',
          vector_store_ids: vectorStoreIds,
          max_num_results: maxNumResults,
        },
      ];
    }

    if (allowedDomains.length > 0) {
      requestData.tools.push({
        type: 'web_search',
        filters: {
          allowed_domains: allowedDomains,
        },
      });
    }

    // // Incluir resultados de búsqueda si se solicita
    // if (includeSearchResults) {
    //   requestData.include = [
    //     'output[0].file_search_call.search_results',
    //     'output[0].web_search_call.action.sources',
    //   ];
    // }

    if (metadata) {
      requestData.metadata = metadata;
    }

    const response = await this.openai.responses.create(requestData);

    // Extraer información de la respuesta
    const output =
      response.output && response.output[0] ? response.output[0] : null;
    let text = '';
    let searchResults = null;

    if (output) {
      // Obtener el texto de la respuesta
      if (output.content && output.content[0]) {
        text = output.content[0].text || '';
      }

      const responseAssistant =
        response.output.find((item) => item.role === 'assistant') || null;
      if (responseAssistant) {
        text = responseAssistant.content[0].text || '';
      }
    }

    return {
      id: response.id,
      output_text: response.output_text,
      output: text,
      searchResults: searchResults,
      usage: response.usage,
      model: response.model,
      rawResponse: response,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    };
  }

  /**
   * Crear respuesta con streaming usando Responses API
   * @param {string} input - Pregunta del usuario
   * @param {function} onChunk - Callback para cada chunk de texto
   * @param {object} config - Configuración (igual que createResponse)
   * @returns {object} - { output, searchResults, usage }
   */
  async createResponseStream(input, onChunk = null, config = {}) {
    const {
      model = 'gpt-4o-2024-11-20',
      instructions = 'Eres un asistente útil.',
      vectorStoreIds = [],
      maxNumResults = 3,
      includeSearchResults = false,
      metadata = null,
      temperature = 1,
    } = config;

    console.log('🚀 Creando respuesta con streaming...');

    const requestData = {
      model,
      input,
      instructions,
      temperature,
      stream: true,
    };

    // Configurar herramientas si hay vector stores
    if (vectorStoreIds.length > 0) {
      requestData.tools = [
        {
          type: 'file_search',
          vector_store_ids: vectorStoreIds,
          max_num_results: maxNumResults,
        },
      ];
    }

    if (includeSearchResults) {
      requestData.include = ['output[0].file_search_call.search_results'];
    }

    if (metadata) {
      requestData.metadata = metadata;
    }

    const stream = await this.openai.responses.create(requestData);

    let fullText = '';
    let searchResults = null;
    let responseId = null;
    let usage = null;

    for await (const chunk of stream) {
      // Manejar diferentes tipos de chunks
      if (chunk.type === 'response.output_item.content_part.delta') {
        const text = chunk.delta && chunk.delta.text ? chunk.delta.text : '';
        if (text) {
          fullText += text;
          if (onChunk) {
            onChunk(text);
          }
        }
      }

      // Capturar resultados de búsqueda
      if (
        chunk.type === 'response.output_item.done' &&
        chunk.output_item &&
        chunk.output_item.file_search_call
      ) {
        searchResults = chunk.output_item.file_search_call.search_results;
      }

      // Capturar ID y usage
      if (chunk.type === 'response.done') {
        responseId = chunk.response.id;
        usage = chunk.response.usage;
      }
    }

    console.log('✅ Respuesta con streaming completada');

    return {
      id: responseId,
      output: fullText,
      searchResults: searchResults,
      usage: usage,
      model,
    };
  }

  /**
   * Búsqueda directa en vector stores sin generar respuesta
   * @param {string} query - Query de búsqueda
   * @param {array} vectorStoreIds - IDs de vector stores
   * @param {number} maxResults - Máximo de resultados
   * @returns {array} - Resultados de búsqueda
   */
  async searchInVectorStores(query, vectorStoreIds, maxResults = 5) {
    console.log(`🔍 Buscando en ${vectorStoreIds.length} vector stores...`);

    const response = await this.createResponse(query, {
      vectorStoreIds,
      maxNumResults: maxResults,
      includeSearchResults: true,
      instructions:
        'Busca información relevante. Responde brevemente mencionando los documentos encontrados.',
    });

    console.log('✅ Búsqueda completada');

    return {
      answer: response.output,
      searchResults: response.searchResults,
      sources: response.searchResults
        ? response.searchResults.map((result) => ({
            score: result.score,
            filename: result.file_name,
            fileId: result.file_id,
            content: result.content
              ? result.content.substring(0, 200) + '...'
              : '',
          }))
        : [],
    };
  }
}

// Exportar todo
module.exports = {
  openai,
  OpenAIManager,
};
