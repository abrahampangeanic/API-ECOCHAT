const { v4: uuidv4 } = require('uuid');
const express = require('express');
const boom = require('@hapi/boom');
const passport = require('passport');
const validatorHandler = require('../middlewares/validator.handler');
const Sentry = require('@sentry/node');

const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();
const AssistantService = require('../services/assistant.service');
const assistantServ = new AssistantService();
const PipelineService = require('../services/pipeline.service');
const pipelineServ = new PipelineService();
const UserService = require('../services/user.service');
const userServ = new UserService();
const QueryService = require('../services/query.service');
const queryServ = new QueryService();
const SessionService = require('../services/session.service');
const sessionServ = new SessionService();
const QuestionService = require('../services/question.service');
const questionServ = new QuestionService();
const sourcesService = require('../services/source.service');
const sourceServ = new sourcesService();
const { getLanguagesWithCache } = require('../cache/source.cache');
const { getUserWithCache } = require('../cache/user.cache');
const { getInstanceWithCache } = require('../cache/instance.cache');
const { getAssistantWithCache } = require('../cache/assistant.cache');

const { createQuestionSchema } = require('../schemas/question.schema');
const router = express.Router({ mergeParams: true });


router.post('/',
  passport.authenticate('jwt', {session: false}),
  // validatorHandler(getDocumentSchema, 'params'),
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
        const { assistantId, question, sessionId, skill } = req.body;
        const userId = req.user.sub;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const assistant = await getAssistantWithCache(assistantId)   
        const instance = await getInstanceWithCache(assistant.instanceId);
        const collections = assistant.collections.map(collection => collection.id);
        const skills = assistant.skills;
        skills.push({id: 0, name: 'SOCIAL_INTERACTION', description: 'SOCIAL_INTERACTION'})
        const user = await getUserWithCache(userId);
        const groups = user.groups;

        const denied_message = assistant.messages.find( item => item.type === "DENIED")
        const message_out_denied = denied_message?.message || `You do not have access `

        const restricted_message = assistant.messages.find( item => item.type === "DENIED")
        const message_out_restricted = restricted_message?.message || `You do not have access to that skill `
        
        const languageMap = questionServ.getLanguageMap();
        const languageProcess = languageMap[instance.lang] || 'English';

        const pipelineMap = questionServ.getPipelineMap();
        let pipeline = skill || await pipelineServ.getPipeline(question);
        console.log("Pipeline: " + pipeline)
        const pipelineProcess = pipelineMap[pipeline] || 'qa';
        
        const languageIn = await pipelineServ.getLanguage(question);
        console.log("LanguageIn: " , languageIn)

        const history = [
          {
            message_type: "assistant",
            message: `Hello!👋 This is the assistant for the ${instance.name}, how can I help?`
          },
        ]
        
        if(pipeline === "QA") pipeline = "Q&A"

        const checkAsistantAccessDenied = questionServ.isAssistantAccessDenied(groups, assistant.id, pipeline);
        const checkAsistantAccessRestricted = questionServ.isAssistantAccessRESTRICTED(groups, assistant.id, pipeline);
        const collectionsAllowed = questionServ.getCollectionsAllowed(groups, collections, pipeline);
        const checkSkillAccess = questionServ.isSkillAccess(skills, pipeline);

        console.log("checkSkillAccess", checkSkillAccess)
        console.log("checkAsistantAccessDenied", checkAsistantAccessDenied)
        console.log("checkAsistantAccessRestricted", checkAsistantAccessRestricted)
        console.log("collectionsAllowed", collectionsAllowed)

        if(checkSkillAccess && !checkAsistantAccessDenied && collectionsAllowed ){
          console.log("Estoy en el pipeline")
          
          const system_prompt = assistant.prompts.find( item => item.type === "SYSTEM") || { prompt: "" };
          const task_prompt = assistant.prompts.find( item => item.type === "TASK") || { prompt: "" };
          const rephrase_prompt = assistant.prompts.find( item => item.type === "REPHRASE") || { prompt: "" };

          const languages = await getLanguagesWithCache(assistant.instanceId);
          console.log("Languages: ", languages)

          const alternative_messages = await pipelineServ.getAlternativeMessages({
            text: question,
            source_language: languageIn,
            languages: languages
          });
          console.log("Alternative Messages: ", alternative_messages)
  
          const dataPipeline = {
            question: question,
            collections: collectionsAllowed,
            history: history, 
            prompts: {
              system_prompt: system_prompt.prompt ,
              task_prompt: task_prompt.prompt,
              rephrase_prompt: rephrase_prompt.prompt , 
            },
            language: languageProcess,
            alternative_messages: alternative_messages
          }
  
          const rta = await pipelineServ.processPipeline(pipelineProcess, dataPipeline)
          const poor_message = assistant.messages.find( item => item.type === "POOR")
          const references = questionServ.getReferenceAllowed(groups, rta.answer.citations, pipeline)

          if(rta){
            let msg_out = rta.answer.answer
            let refs = JSON.stringify(references) || ""
            if(checkAsistantAccessRestricted ) refs = ""

            if(pipeline === "SEARCH" && references.length == 0 && !msg_out )   msg_out = "I can't answer that question based on the provided information"
            if(poor_message && msg_out === "I can't answer that question based on the provided information")  msg_out = poor_message.message
  
            const languageOut = await pipelineServ.getLanguage(msg_out);
            console.log("LanguageOut: " , languageOut)

            if ( languageIn !== languageOut ) {
              const translated = await pipelineServ.translateRelay({
                text: msg_out,
                source_language: languageOut,
                target_language: languageIn
              });
              msg_out = translated;
            }
            
            const queryId = uuidv4();
            const created = new Date();
            const now2 = created.toISOString().replace('T', ' ').slice(0, 19);

            const queryData = {
              id: queryId,
              message_in: question,
              message_out: msg_out,
              feedback: 0,
              feedback_message: "",
              refs: refs,
              ts_in: now,
              ts_out: now2,
              tokens_in: rta.token_usage.net_input,
              tokens_out: rta.token_usage.net_output,
              task_prompt: null,
              skill: pipeline,
              sessionId: sessionId,
              assistantId: assistantId,
              instanceId: assistant.instanceId,
              createdAt: created
            }
  
            queryServ.create(queryData);

            if(
              history.length === 1 && 
              rta.answer.answer && 
              rta.answer.answer !== "I can't answer that question based on the provided information")
            {
              pipelineServ.getSessionName(sessionId, question, msg_out);   
            }

            let safeRefs = checkAsistantAccessRestricted ? [] : JSON.parse(refs);
            res.status(200).json({ query:  {...queryData, refs: safeRefs }  });
          }
          else {
            const message_out = `The skill system is not responding`
            res.status(200).json({ query: { message_out: message_out } });
          }
        }
        else
        {
          console.log("No estoy en el pipeline")
          res.status(200).json({ query: { message_out: message_out_denied }});
        }
    } catch (error) {
      next(error);
    }
  }
);

router.post('/public',
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assistantId, question, sessionId, skill } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const assistant = await getAssistantWithCache(assistantId)   
      if(assistant.access_type !== "PUBLIC") throw boom.unauthorized();
      const instance = await getInstanceWithCache(assistant.instanceId);
      let skills = assistant.skills;
      skills.push({id: 0, name: 'SOCIAL_INTERACTION', description: 'SOCIAL_INTERACTION'})

      const languageMap = questionServ.getLanguageMap();
      const languageProcess = languageMap[instance.lang] || 'English';

      const pipelineMap = questionServ.getPipelineMap();
      let pipeline = skill || await pipelineServ.getPipeline(question);
      console.log("Pipeline: " + pipeline)
      const pipelineProcess = pipelineMap[pipeline] || 'qa';

      const languageIn = await pipelineServ.getLanguage(question);
      console.log("LanguageIn: " , languageIn)
      
      const history = [
        {
          message_type: "assistant",
          message: `Hello!👋 This is the assistant for the ${instance.name}, how can I help?`
        },
      ]

      if(pipeline === "QA") pipeline = "Q&A"

      if(skills.some(objeto => objeto.name === pipeline)){
        console.log("Estoy en el pipeline")
        const collections = assistant.collections.map(collection => collection.id);
        const system_prompt = assistant.prompts.find( item => item.type === "SYSTEM") || { prompt: "" };
        const task_prompt = assistant.prompts.find( item => item.type === "TASK") || { prompt: "" };
        const rephrase_prompt = assistant.prompts.find( item => item.type === "REPHRASE") || { prompt: "" };

        const languages = await getLanguagesWithCache(assistant.instanceId);
        console.log("Languages: ", languages)
        
        const alternative_messages = await pipelineServ.getAlternativeMessages({
          text: question,
          language: languageProcess,
          prompt: system_prompt.prompt,
          history: history
        });
        console.log("Alternative Messages: ", alternative_messages)

        const dataPipeline = {
          question: question,
          collections: collections,
          history: history, 
          prompts: {
            system_prompt: system_prompt.prompt ,
            task_prompt: task_prompt.prompt,
            rephrase_prompt: rephrase_prompt.prompt , 
          },
          language: languageProcess,
          alternative_messages: alternative_messages
        }

        const rta = await pipelineServ.processPipeline(pipelineProcess, dataPipeline)
        const poor_message = assistant.messages.find( item => item.type === "POOR")
        
        if(rta){
          let msg_out = rta.answer.answer
          const refs = JSON.stringify(rta.answer.citations) || ""

          if(pipeline === "SEARCH" && references.length == 0 && !msg_out )   msg_out = "I can't answer that question based on the provided information"
          if(poor_message && msg_out === "I can't answer that question based on the provided information")  msg_out = poor_message.message

          const languageOut = await pipelineServ.getLanguage(msg_out);
          console.log("LanguageOut: " , languageOut)

          if ( languageIn !== languageOut ) {
            const translated = await pipelineServ.translateRelay({
              text: msg_out,
              source_language: languageOut,
              target_language: languageIn
            });
            msg_out = translated;
          }

          const queryId = uuidv4();
          const created = new Date();
          const now2 = created.toISOString().replace('T', ' ').slice(0, 19);
          
          const queryData = {
            id: queryId,
            message_in: question,
            message_out: msg_out,
            feedback: 0,
            feedback_message: "",
            refs: refs,
            ts_in: now,
            ts_out: now2,
            tokens_in: rta.token_usage.net_input,
            tokens_out: rta.token_usage.net_output,
            task_prompt: null,
            skill: pipeline,
            sessionId: sessionId,
            assistantId: assistantId,
            instanceId: assistant.instanceId,
            createdAt: created
          }

          queryServ.create(queryData);

          queryData.refs = JSON.parse(refs)
          res.status(200).json({ query: queryData  });
        }
      }
      else
      {
        console.log("No estoy en el pipeline")
        const denied_message = assistant.messages.find( item => item.type === "DENIED")
        const message_out = denied_message || `You do not have access to that skill`
        res.status(200).json({ query: { message_out: message_out } });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;