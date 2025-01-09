/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Endpoints for managing questions
 */

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Question
 *     tags: [Questions]
 *     description: Question. Requires authentication with JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assistantId
 *               - question
 *               - sessionId
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: ID of the assistant.
 *               question:
 *                 type: string
 *                 description: Question.
 *               sessionId:
 *                 type: string
 *                 description: ID of the session.
 *               skill:
 *                 type: string
 *                 description: Type of skill being requested.
 *                 enum:
 *                   - QA
 *                   - SEARCH
 *                   - SUMMARIZE
 *                   - GENERATE
 *               history:
 *                 type: array
 *                 description: History of the conversation.
 *                 items:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Message content.
 *                     message_type:
 *                       type: string
 *                       description: Type of message (e.g., "assistant" or "user").
 *                       enum:
 *                         - assistant
 *                         - user    
 *     responses:
 *       200:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier of the query.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of query creation.
 *                     message_in:
 *                       type: string
 *                       description: User's question.
 *                     message_out:
 *                       type: string
 *                       description: Assistant's response.
 *                     feedback:
 *                       type: integer
 *                       description: Feedback rating for the response.
 *                     feedback_message:
 *                       type: string
 *                       description: Feedback message from the user.
 *                     refs:
 *                       type: array
 *                       description: References related to the response.
 *                       items:
 *                         type: string
 *                     ts_in:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of the incoming question.
 *                     ts_out:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of the outgoing response.
 *                     tokens_in:
 *                       type: integer
 *                       description: Number of tokens in the question.
 *                     tokens_out:
 *                       type: integer
 *                       description: Number of tokens in the response.
 *                     task_prompt:
 *                       type: string
 *                       description: Prompt used for task processing.
 *                     skill:
 *                       type: string
 *                       description: Skill used to process the question.
 *                     sessionId:
 *                       type: string
 *                       description: ID of the associated session.
 *                     assistantId:
 *                       type: string
 *                       description: ID of the assistant that processed the question.
 *                     instanceId:
 *                       type: string
 *                       description: ID of the associated instance.
 *               example:
 *                 query:
 *                   id: "4e24d0ae-7c1e-45aa-8471-9fde831101a2"
 *                   createdAt: "2025-01-03T09:50:40.209Z"
 *                   message_in: "quienes son ustedes?"
 *                   message_out: "We are ECOChat"
 *                   feedback: 0
 *                   feedback_message: ""
 *                   refs: []
 *                   ts_in: "2025-01-03 09:50:37"
 *                   ts_out: "2025-01-03 09:50:40"
 *                   tokens_in: 12
 *                   tokens_out: 0
 *                   task_prompt: null
 *                   skill: "Q&A"
 *                   sessionId: "32592ee7-7a07-46c0-987d-952b94300df6"
 *                   assistantId: "22deccd5-3cb2-425f-b1ac-6c89bcc9b24f"
 *                   instanceId: "a9b2e949-5e12-4c6b-98d8-65c81ae02663"
 *       400:
 *         description: Invalid data in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *       401:
 *         description: Unauthorized. The JWT token is invalid or the user lacks permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden. The user does not have access to this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

/**
 * @swagger
 * /questions/public:
 *   post:
 *     summary: Question
 *     tags: [Questions]
 *     description: Question.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assistantId
 *               - question
 *               - sessionId
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: ID of the assistant.
 *               question:
 *                 type: string
 *                 description: Question.
 *               sessionId:
 *                 type: string
 *                 description: ID of the session.
 *               skill:
 *                 type: string
 *                 description: Type of skill being requested.
 *                 enum:
 *                   - QA
 *                   - SEARCH
 *                   - SUMMARIZE
 *                   - GENERATE
 *               history:
 *                 type: array
 *                 description: History of the conversation.
 *                 items:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Message content.
 *                     message_type:
 *                       type: string
 *                       description: Type of message (e.g., "assistant" or "user").
 *                       enum:
 *                         - assistant
 *                         - user    
 *     responses:
 *       200:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier of the query.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of query creation.
 *                     message_in:
 *                       type: string
 *                       description: User's question.
 *                     message_out:
 *                       type: string
 *                       description: Assistant's response.
 *                     feedback:
 *                       type: integer
 *                       description: Feedback rating for the response.
 *                     feedback_message:
 *                       type: string
 *                       description: Feedback message from the user.
 *                     refs:
 *                       type: array
 *                       description: References related to the response.
 *                       items:
 *                         type: string
 *                     ts_in:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of the incoming question.
 *                     ts_out:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of the outgoing response.
 *                     tokens_in:
 *                       type: integer
 *                       description: Number of tokens in the question.
 *                     tokens_out:
 *                       type: integer
 *                       description: Number of tokens in the response.
 *                     task_prompt:
 *                       type: string
 *                       description: Prompt used for task processing.
 *                     skill:
 *                       type: string
 *                       description: Skill used to process the question.
 *                     sessionId:
 *                       type: string
 *                       description: ID of the associated session.
 *                     assistantId:
 *                       type: string
 *                       description: ID of the assistant that processed the question.
 *                     instanceId:
 *                       type: string
 *                       description: ID of the associated instance.
 *               example:
 *                 query:
 *                   id: "4e24d0ae-7c1e-45aa-8471-9fde831101a2"
 *                   createdAt: "2025-01-03T09:50:40.209Z"
 *                   message_in: "quienes son ustedes?"
 *                   message_out: "We are ECOChat"
 *                   feedback: 0
 *                   feedback_message: ""
 *                   refs: []
 *                   ts_in: "2025-01-03 09:50:37"
 *                   ts_out: "2025-01-03 09:50:40"
 *                   tokens_in: 12
 *                   tokens_out: 0
 *                   task_prompt: null
 *                   skill: "Q&A"
 *                   sessionId: "32592ee7-7a07-46c0-987d-952b94300df6"
 *                   assistantId: "22deccd5-3cb2-425f-b1ac-6c89bcc9b24f"
 *                   instanceId: "a9b2e949-5e12-4c6b-98d8-65c81ae02663"
 *       400:
 *         description: Invalid data in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *       401:
 *         description: Unauthorized. The JWT token is invalid or the user lacks permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden. The user does not have access to this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */