const { v4: uuidv4 } = require('uuid');
const express = require('express');
// const boom = require('@hapi/boom');
const passport = require('passport');
const validatorHandler = require('../../middlewares/validator.handler');
const { instructions } = require('../../libs/openai-instruction');

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

// Response without context
router.post(
  '/public-ask-light',
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

      const response = await openaiManager.createResponse(question, {
        vectorStoreIds: vectorStoreIds,
        instructions: instructions,
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

// Response with context
router.post(
  '/public-ask-context',
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const assistant = await getAssistantWithCache(assistantId);

      const queryOpenai = await openaiManager.askAssistant(
        assistantId,
        question,
        sessionId
      );
      const response = queryOpenai.answer;

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
        instructions: instructions,
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
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId } = req.body;
      const assistant = await getAssistantWithCache(assistantId);

      // Set headers for streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Use OpenAI streaming. Assume openaiManager.askAssistantStream exists and returns an async iterator
      const stream = await openaiManager.askAssistantStream(
        assistantId,
        question,
        sessionId
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

module.exports = router;
