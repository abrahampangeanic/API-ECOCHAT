const express = require('express');

// Import all routers
const authRouter = require('./auth.router');
const profileRouter = require('./profile.router');
const usersRouter = require('./users.router');
const instanceRouter = require('./instance.router');
const documentRouter = require('./document.router');
const sessionRouter = require('./session.router');
const queryRouter = require('./query.router');
const questionRouter = require('./question.router');
const assistantRouter = require('./assistant.router');
const assistantCollectionRouter = require('./assistantcollection.router');
const assistantMessageRouter = require('./assistantmessage.router');
const assistantPromptRouter = require('./assistantprompt.router');
const assistantSkillRouter = require('./assistantskill.router');
const collectionRouter = require('./collection.router');
const collectionSourcesRouter = require('./collectionsources.router');
const sourceRouter = require('./source.router');
const groupRouter = require('./group.router');
const userGroupRouter = require('./usergroup.router');
const permissionRouter = require('./permission.router');
const promptRouter = require('./prompt.router');
const statsRouter = require('./stats.router');

// Create router
const router = express.Router();

// Configure routes
router.use('/auth', authRouter);
router.use('/register', profileRouter);
router.use('/profile', profileRouter);
router.use('/users', usersRouter);
router.use('/instances', instanceRouter);
router.use('/documents', documentRouter);
router.use('/sessions', sessionRouter);
router.use('/queries', queryRouter);
router.use('/questions', questionRouter);
router.use('/assistants', assistantRouter);
router.use('/assistant-collections', assistantCollectionRouter);
router.use('/assistant-messages', assistantMessageRouter);
router.use('/assistant-prompts', assistantPromptRouter);
router.use('/assistant-skills', assistantSkillRouter);
router.use('/collections', collectionRouter);
router.use('/collection-sources', collectionSourcesRouter);
router.use('/sources', sourceRouter);
router.use('/groups', groupRouter);
router.use('/user-groups', userGroupRouter);
router.use('/permissions', permissionRouter);
router.use('/prompts', promptRouter);
router.use('/stats', statsRouter);

// Export router directly
module.exports = router;
