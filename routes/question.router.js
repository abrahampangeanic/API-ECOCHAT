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

const { createQuestionSchema } = require('../schemas/question.schema');


const router = express.Router({ mergeParams: true });

router.post('/',
  passport.authenticate('jwt', {session: false}),
  // validatorHandler(getDocumentSchema, 'params'),
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
        // const { documentId } = req.params;
        const { assistantId, question, sessionId } = req.body;
        const userId = req.user.sub;
        const assistant = await assistantServ.findOneFull(assistantId)
        const instance = await instanceServ.findOne(assistant.instanceId);
        const skills = assistant.skills;
        const pipeline = await pipelineServ.getPipeline(question);
        const user = await userServ.findOneWithPermissions(userId);
        const groups = user.groups;
        
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
          SUMMARIZATION: 'summarize',
          GENERATE: 'generate',
          SOCIAL_INTERACTION: 'social',
        };
        
        const pipelineProcess = pipelineMap[pipeline] || 'qa';

        /// Verificar la seguridad de los groups y permissions
        console.log(pipeline)
        
        if(skills.some(objeto => objeto.name === pipeline)){
          console.log("Estoy en el pipeline")
          const system_prompt = assistant.prompts.find( item => item.type === "SYSTEM") || { prompt: "" };
          const task_prompt = assistant.prompts.find( item => item.type === "TASK") || { prompt: "" };
          const rephrase_prompt = assistant.prompts.find( item => item.type === "REPHRASE") || { prompt: "" };
  
          const dataPipeline = {
            question: question,
            collections: collections,
            history: [], 
            prompts: {
              system_prompt: system_prompt.prompt ,
              task_prompt: task_prompt.prompt,
              rephrase_prompt: rephrase_prompt.prompt , 
            },
            language: languageProcess
          }
  
          const rta = await pipelineServ.processPipeline(pipelineProcess, dataPipeline)
        
          const poor_message = assistant.messages.find( item => item.type === "POOR")
  
          // console.log(answer)

          if(rta){
            let msg_out = rta.answer.answer

            if(poor_message && msg_out === "I can't answer that question based on the provided information")  msg_out = poor_message.message
  
            const now2 = new Date().toISOString().replace('T', ' ').slice(0, 19);
            
            const queryData = {
              message_in: question,
              message_out: msg_out,
              feedback: 0,
              feedback_message: "",
              refs: "",
              ts_in: now,
              ts_out: now2,
              tokens_in: rta.token_usage.net_input,
              tokens_out: rta.token_usage.net_output,
              task_prompt: "",
              skill: pipeline,
              sessionId: sessionId,
              assistantId: assistantId,
              instanceId: assistant.instanceId,
            }
  
            const query = await queryServ.create(queryData);

            // const sessionTitle = await pipelineServ.getSessionName(sessionId, question, answer.answer.answer);
            // console.log("Session title: " + sessionTitle)

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


router.post('/public',
  // validatorHandler(getDocumentSchema, 'params'),
  validatorHandler(createQuestionSchema, 'body'),
  async (req, res, next) => {
    try {
      // const { documentId } = req.params;
      const { assistantId, question, sessionId } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      // const userId = req.user.sub;
      const assistant = await assistantServ.findOneFull(assistantId)
      const instance = await instanceServ.findOne(assistant.instanceId);
      let skills = assistant.skills;
      skills.push({id: 0, name: 'SOCIAL_INTERACTION', description: 'SOCIAL_INTERACTION'})
      const pipeline = await pipelineServ.getPipeline(question);
      // const user = await userServ.findOneWithPermissions(userId);
      // const groups = user.groups;

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
      

      /// Verificar la seguridad de los groups y permissions
      console.log(pipeline)
      
      if(skills.some(objeto => objeto.name === pipeline)){
        console.log("Estoy en el pipeline")
        const collections = assistant.collections.map(collection => collection.id);
        const system_prompt = assistant.prompts.find( item => item.type === "SYSTEM") || { prompt: "" };
        const task_prompt = assistant.prompts.find( item => item.type === "TASK") || { prompt: "" };
        const rephrase_prompt = assistant.prompts.find( item => item.type === "REPHRASE") || { prompt: "" };

        const dataPipeline = {
          question: question,
          collections: collections,
          history: [], 
          prompts: {
            system_prompt: system_prompt.prompt ,
            task_prompt: task_prompt.prompt,
            rephrase_prompt: rephrase_prompt.prompt , 
          },
          language: languageProcess
        }

        const rta = await pipelineServ.processPipeline(pipelineProcess, dataPipeline)
      
        const poor_message = assistant.messages.find( item => item.type === "POOR")

        // console.log(answer)
        
        if(rta){
          let msg_out = rta.answer.answer
          const refs = JSON.stringify(rta.answer.citations) || ""

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
            task_prompt: "",
            skill: pipeline,
            sessionId: sessionId,
            assistantId: assistantId,
            instanceId: assistant.instanceId,
          }

          const query = await queryServ.create(queryData);

          // const sessionTitle = await pipelineServ.getSessionName(sessionId, question, answer.answer.answer);
          // console.log("Session title: " + sessionTitle)

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