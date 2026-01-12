const { v4: uuidv4 } = require('uuid');
const express = require('express');
// const boom = require('@hapi/boom');
const passport = require('passport');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  instructionContext,
  instructionWithOutContext,
} = require('../../libs/openai-instruction');

const QueryService = require('../../services/query.service');
const queryServ = new QueryService();
// const SessionService = require('../../services/session.service');
// const sessionServ = new SessionService();

// const { getInstanceWithCache } = require('../../cache/instance.cache');
const { getAssistantWithCache } = require('../../cache/assistant.cache');

const { createQuestionSchema } = require('../../schemas/question.schema');
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

// PRIVATE QUESTION (Requires authentication)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  // validatorHandler(getDocumentSchema, 'params'),
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const assistant = await getAssistantWithCache(assistantId);

      const vectorStoreIds = assistant.collections.map(
        (collection) => collection.openai_id
      );

      console.log('🔍 Vector stores:', vectorStoreIds);

      const queryOpenai = await openaiManager.askAssistant(
        assistantId,
        question,
        sessionId
      );
      const msg_out = queryOpenai.answer;

      const queryId = uuidv4();
      const created = new Date();
      const now2 = created.toISOString().replace('T', ' ').slice(0, 19);

      const queryData = {
        id: queryId,
        message_in: question,
        message_out: msg_out,
        feedback: 0,
        feedback_message: '',
        refs: null,
        ts_in: now,
        ts_out: now2,
        tokens_in: 0,
        tokens_out: 0,
        task_prompt: null,
        skill: 'OPENAI',
        sessionId: sessionId,
        assistantId: assistantId,
        instanceId: assistant.instanceId,
        createdAt: created,
      };

      queryServ.create(queryData);
      res.status(200).json({ query: queryData });
    } catch (error) {
      next(error);
    }
  }
);

// PUBLIC QUESTION (Without context)
router.post(
  '/public-ask-light',
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const assistant = await getAssistantWithCache(assistantId);
      const allowedDomains = [];

      if (assistant.collections) {
        assistant.collections.map((collection) => {
          collection.sources.map((source) => {
            if (source.sourcetype === 'WEB') {
              allowedDomains.push(source.reference);
            }
          });
        });
      }

      const cleanAllowedDomains = openaiManager.cleanDomains(allowedDomains);
      console.log('🔍 Clean allowed domains:', cleanAllowedDomains);

      const vectorStoreIds = assistant.collections.map(
        (collection) => collection.openai_id
      );

      const prompt = assistant.prompts.find(
        (item) => item.type === 'WithoutContext'
      );
      const instructions = prompt ? prompt.prompt : instructionWithOutContext;

      const response = await openaiManager.createResponse(question, {
        vectorStoreIds: vectorStoreIds,
        instructions: instructions,
        allowedDomains: cleanAllowedDomains,
      });

      const queryId = uuidv4();
      const created = new Date();
      const now2 = created.toISOString().replace('T', ' ').slice(0, 19);

      const queryData = {
        id: queryId,
        message_in: question,
        message_out: response.output_text,
        input_tokens: response.input_tokens,
        output_tokens: response.output_tokens,
        feedback: 0,
        feedback_message: '',
        refs: null,
        ts_in: now,
        ts_out: now2,
        tokens_in: 0,
        tokens_out: 0,
        task_prompt: null,
        skill: 'OPENAI',
        sessionId: sessionId,
        assistantId: assistantId,
        instanceId: assistant.instanceId,
        createdAt: created,
      };

      queryServ.create(queryData);
      res.status(200).json({ query: queryData });
    } catch (error) {
      next(error);
    }
  }
);

// PUBLIC QUESTION (With context)
router.post(
  '/public-ask-context',
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const assistant = await getAssistantWithCache(assistantId);
      const allowedDomains = [];

      if (assistant.collections) {
        assistant.collections.map((collection) => {
          collection.sources.map((source) => {
            if (source.sourcetype === 'WEB') {
              allowedDomains.push(source.reference);
            }
          });
        });
      }

      const cleanAllowedDomains = openaiManager.cleanDomains(allowedDomains);

      const prompt = assistant.prompts.find((item) => item.type === 'Context');
      const instructions = prompt ? prompt.prompt : instructionContext;

      const queryOpenai = await openaiManager.askAssistant(
        assistant.openai_id,
        question,
        sessionId,
        { instructions: instructions },
        cleanAllowedDomains
      );

      const queryId = uuidv4();
      const created = new Date();
      const now2 = created.toISOString().replace('T', ' ').slice(0, 19);

      const queryData = {
        id: queryId,
        message_in: question,
        message_out: queryOpenai.answer,
        input_tokens: queryOpenai.input_tokens,
        output_tokens: queryOpenai.output_tokens,
        feedback: 0,
        feedback_message: '',
        refs: null,
        ts_in: now,
        ts_out: now2,
        tokens_in: 0,
        tokens_out: 0,
        task_prompt: null,
        skill: 'OPENAI',
        sessionId: sessionId,
        assistantId: assistantId,
        instanceId: assistant.instanceId,
        createdAt: created,
      };

      queryServ.create(queryData);
      res.status(200).json({ query: queryData });
    } catch (error) {
      next(error);
    }
  }
);

// Streamed response without context
router.post(
  '/public-stream-light',
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId } = req.body;
      const assistant = await getAssistantWithCache(assistantId);

      const vectorStoreIds = assistant.collections.map(
        (collection) => collection.openai_id
      );

      const options = {
        vectorStoreIds: vectorStoreIds,
        instructions: instructionContext,
      };

      // Set headers for streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Use OpenAI streaming. Assume openaiManager.askAssistantStream exists and returns an async iterator
      const stream = await openaiManager.askAssistantStream(
        assistantId,
        question,
        sessionId,
        options
      );

      let fullAnswer = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const chunk of stream) {
        // Assuming each chunk has the following structure:
        // { text: '...', input_tokens, output_tokens }
        if (chunk.text) {
          fullAnswer += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
        if (chunk.input_tokens) inputTokens = chunk.input_tokens;
        if (chunk.output_tokens) outputTokens = chunk.output_tokens;
      }

      // Finalize SSE
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      // Save query in background, doesn't block response
      (async () => {
        try {
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          const created = new Date();
          const now2 = created.toISOString().replace('T', ' ').slice(0, 19);
          const queryId = uuidv4();
          const queryData = {
            id: queryId,
            message_in: question,
            message_out: fullAnswer,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            feedback: 0,
            feedback_message: '',
            refs: null,
            ts_in: now,
            ts_out: now2,
            tokens_in: 0,
            tokens_out: 0,
            task_prompt: null,
            skill: 'OPENAI',
            sessionId: sessionId,
            assistantId: assistantId,
            instanceId: assistant.instanceId,
            createdAt: created,
          };
          await queryServ.create(queryData);
        } catch (err) {
          // ignore background errors
        }
      })();
    } catch (error) {
      // SSE error handling
      res.write(`data: ${JSON.stringify({ error: 'Error en el stream' })}\n\n`);
      res.end();
      next(error);
    }
  }
);

// Streamed response with context
router.post(
  '/public-stream-context',
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res) => {
    let fullAnswer = '';

    try {
      const { assistantId, question, sessionId } = req.body;
      const assistant = await getAssistantWithCache(assistantId);

      // Set headers for streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      console.log('🔍 Assistant OpenAI ID:', assistant.openai_id);
      console.log('🔍 Question:', question);
      console.log('🔍 Session ID:', sessionId);

      // Use OpenAI streaming with callbacks
      await openaiManager.askAssistantStream(
        assistant.openai_id,
        question,
        sessionId,
        // onChunk - se ejecuta por cada fragmento de texto
        (chunk) => {
          fullAnswer += chunk;

          // Verificar si la respuesta sigue abierta antes de escribir
          if (!res.writableEnded) {
            try {
              res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            } catch (e) {
              console.error('Error escribiendo chunk:', e.message);
            }
          }
        },
        // onComplete - se ejecuta al finalizar
        () => {
          console.log(
            '🎯 onComplete ejecutado, fullAnswer length:',
            fullAnswer.length
          );

          // Verificar si la respuesta sigue abierta antes de finalizar
          if (!res.writableEnded) {
            try {
              // Finalize SSE
              console.log('📤 Enviando done: true al cliente');
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              res.end();
              console.log('✅ Stream finalizado correctamente');
            } catch (e) {
              console.error('Error finalizando stream:', e.message);
            }
          } else {
            console.log(
              '⚠️  Response ya estaba cerrado, no se puede enviar done'
            );
          }
        }
      );

      // Save query in background, doesn't block response
      (async () => {
        try {
          // Esperar un poco para asegurar que fullAnswer está completo
          await new Promise((resolve) => setTimeout(resolve, 100));

          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          const created = new Date();
          const now2 = created.toISOString().replace('T', ' ').slice(0, 19);
          const queryId = uuidv4();
          const queryData = {
            id: queryId,
            message_in: question,
            message_out: fullAnswer,
            input_tokens: 0,
            output_tokens: 0,
            feedback: 0,
            feedback_message: '',
            refs: null,
            ts_in: now,
            ts_out: now2,
            tokens_in: 0,
            tokens_out: 0,
            task_prompt: null,
            skill: 'OPENAI',
            sessionId: sessionId,
            assistantId: assistantId,
            instanceId: assistant.instanceId,
            createdAt: created,
          };
          await queryServ.create(queryData);
        } catch (err) {
          console.error('Error saving query:', err);
        }
      })();
    } catch (error) {
      console.log('\n🚨 ======= ERROR EN ENDPOINT STREAMING =======');
      console.log('Tipo de error:', error.constructor.name);
      console.log('Mensaje:', error.message);
      console.log('Stack:', error.stack ? error.stack.split('\n')[0] : 'N/A');

      // Identificar el origen del error
      if (error.status) {
        console.log('📍 Origen: OPENAI API');
        console.log(`   HTTP Status: ${error.status}`);
        console.log(`   Type: ${error.type || 'N/A'}`);
      } else if (error.message && error.message.includes('terminated')) {
        console.log('📍 Origen: CONEXIÓN INTERRUMPIDA');
      } else if (error.code) {
        console.log('📍 Origen: SISTEMA/RED');
        console.log(`   Código: ${error.code}`);
      } else {
        console.log('📍 Origen: APLICACIÓN');
      }

      console.log('Full Answer acumulado:', fullAnswer.length, 'caracteres');
      console.log('=============================================\n');

      // Intentar enviar error solo si la respuesta no se cerró
      if (!res.writableEnded) {
        try {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'text/event-stream');
          }

          const errorMessage =
            error.type === 'rate_limit_error'
              ? 'Límite de consultas excedido. Intenta en unos minutos.'
              : error.status
              ? `Error de OpenAI (${error.status})`
              : 'Error en el stream';

          res.write(
            `data: ${JSON.stringify({
              error: errorMessage,
              message: error.message,
              type: error.type || 'unknown',
            })}\n\n`
          );
          res.end();
        } catch (e) {
          console.error('Error enviando mensaje de error:', e.message);
        }
      } else {
        console.log(
          '⚠️  No se pudo enviar error al cliente (response ya cerrado)'
        );
      }

      // NO llamar a next() porque ya manejamos la respuesta SSE
    }
  }
);

module.exports = router;
