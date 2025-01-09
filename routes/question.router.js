const express = require('express');
const boom = require('@hapi/boom');
const passport = require('passport');
const validatorHandler = require('../middlewares/validator.handler');

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

const { createQuestionSchema } = require('../schemas/question.schema');
const router = express.Router({ mergeParams: true });

router.post('/',
  passport.authenticate('jwt', {session: false}),
  // validatorHandler(getDocumentSchema, 'params'),
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
        const { assistantId, question, sessionId, skill } = req.body;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const userId = req.user.sub;
        const assistant = await assistantServ.findOneFull(assistantId)
        const instance = await instanceServ.findOne(assistant.instanceId);
        const collections = assistant.collections.map(collection => collection.id);
        const skills = assistant.skills;
        skills.push({id: 0, name: 'SOCIAL_INTERACTION', description: 'SOCIAL_INTERACTION'})
        const user = await userServ.findOneWithPermissions(userId);
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

        if(checkSkillAccess && !checkAsistantAccessDenied && collectionsAllowed ){
          console.log("Estoy en el pipeline")
          const system_prompt = assistant.prompts.find( item => item.type === "SYSTEM") || { prompt: "" };
          const task_prompt = assistant.prompts.find( item => item.type === "TASK") || { prompt: "" };
          const rephrase_prompt = assistant.prompts.find( item => item.type === "REPHRASE") || { prompt: "" };
  
          const dataPipeline = {
            question: question,
            collections: collectionsAllowed,
            history: history, 
            prompts: {
              system_prompt: system_prompt.prompt ,
              task_prompt: task_prompt.prompt,
              rephrase_prompt: rephrase_prompt.prompt , 
            },
            language: languageProcess
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
  
            const now2 = new Date().toISOString().replace('T', ' ').slice(0, 19);
            
            const queryData = {
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
            }
  
            const query = await queryServ.create(queryData);

            if(
              history.length === 1 && 
              rta.answer.answer && 
              rta.answer.answer !== "I can't answer that question based on the provided information")
            {
              try {
                const sessionTitle = await pipelineServ.getSessionName(sessionId, question, msg_out);
                console.log(`Session title: ${sessionTitle}`);
              } catch (error) {
                console.error("Error fetching session title:", error);
              }
            }

            if(checkAsistantAccessRestricted ) query.refs = []
            else query.refs = JSON.parse(query.refs)
            
            res.status(200).json({ query: query  });
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
      const assistant = await assistantServ.findOneFull(assistantId)
      if(assistant.access_type !== "PUBLIC") throw boom.unauthorized();
      const instance = await instanceServ.findOne(assistant.instanceId);
      let skills = assistant.skills;
      skills.push({id: 0, name: 'SOCIAL_INTERACTION', description: 'SOCIAL_INTERACTION'})
      let pipeline = skill || await pipelineServ.getPipeline(question);
      console.log("Pipeline: " + pipeline)
      
      const languageMap = {
        EN: 'English',
        ES: 'Spanish',
        PT: 'Portuguese',
        FR: 'French',
        DE: 'German',
      }
     
      const languageProcess = languageMap[instance.lang] || 'English';

      const pipelineMap = {
        QA: 'qa',
        SEARCH: 'search',
        SUMMARIZE: 'summarize',
        GENERATE: 'generate',
        SOCIAL_INTERACTION: 'social',
      };
      
      const pipelineProcess = pipelineMap[pipeline] || 'qa';
      
      const history = [
        {
          message_type: "assistant",
          message: `Hello!👋 This is the assistant for the ${instance.name}, how can I help?`
        },
      ]
      /// Verificar la seguridad de los groups y permissions
      console.log("Pipeline: " + pipeline)
      if(pipeline === "QA") pipeline = "Q&A"

      if(skills.some(objeto => objeto.name === pipeline)){
        console.log("Estoy en el pipeline")
        const collections = assistant.collections.map(collection => collection.id);
        const system_prompt = assistant.prompts.find( item => item.type === "SYSTEM") || { prompt: "" };
        const task_prompt = assistant.prompts.find( item => item.type === "TASK") || { prompt: "" };
        const rephrase_prompt = assistant.prompts.find( item => item.type === "REPHRASE") || { prompt: "" };

        const dataPipeline = {
          question: question,
          collections: collections,
          history: history, 
          prompts: {
            system_prompt: system_prompt.prompt ,
            task_prompt: task_prompt.prompt,
            rephrase_prompt: rephrase_prompt.prompt , 
          },
          language: languageProcess
        }

        const rta = await pipelineServ.processPipeline(pipelineProcess, dataPipeline)
      
        const poor_message = assistant.messages.find( item => item.type === "POOR")
        
        if(rta){
          let msg_out = rta.answer.answer
          const refs = JSON.stringify(rta.answer.citations) || ""

          if(pipeline === "SEARCH" && references.length == 0 && !msg_out )   msg_out = "I can't answer that question based on the provided information"
          if(poor_message && msg_out === "I can't answer that question based on the provided information")  msg_out = poor_message.message

          const now2 = new Date().toISOString().replace('T', ' ').slice(0, 19);
          
          const queryData = {
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
          }

          const query = await queryServ.create(queryData);

          query.refs = JSON.parse(query.refs)
          
          res.status(200).json({ query: query  });
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