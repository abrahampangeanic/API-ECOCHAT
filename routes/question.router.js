const express = require('express');
const boom = require('@hapi/boom');
const passport = require('passport');
const validatorHandler = require('../middlewares/validator.handler');

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
        const skills = assistant.skills;
        const pipeline = await pipelineServ.getPipeline(question);
        const user = await userServ.findOneWithPermissions(userId);
        const groups = user.groups;
        

        /// Verificar la seguridad de los groups y permissions
        console.log(pipeline)
        
        if(skills.some(objeto => objeto.name === pipeline)){
          console.log("Estoy en el pipeline")
          const collections = assistant.collections.map(collection => collection.id);

          const dataPipeline = {
            question: question,
            collections: collections,
            history: [],
            prompts: {
              system_prompt: "",
              task_prompt: "",
              rephrase_prompt: ""
            }
          }

          const answer = await pipelineServ.qa(dataPipeline)

          if(answer){
            const queryData = {
              message_in: question,
              message_out: answer.answer.answer,
              feedback: 0,
              feedback_message: "",
              refs: "",
              ts_in: "",
              ts_out: "",
              tokens_in: answer.token_usage.net_input,
              tokens_out: answer.token_usage.net_output,
              task_prompt: "",
              skill: pipeline,
              sessionId: sessionId,
              assistantId: assistantId,
              instanceId: assistant.instanceId,
            }

            const query = await queryServ.create(queryData);

            // const sessionTitle = await pipelineServ.getSessionName(sessionId, question, answer.answer.answer);
            // console.log("Session title: " + sessionTitle)
            
            res.status(200).json({ query: query  });
          }



          // res.status(200).json({ message: "hola que tal" });
        }
        else
        {
          console.log("No estoy en el pipeline")

          res.status(200).json({ query: { message_out: 'No tiene acceso a esa skill' } });
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
        // const { status } = req.body;

        // const document = await service.update({id: documentId, statu: status }); // Extractor ID hardcoded for now
        // console.log(document);
        // // Send an appropriate response to the client
        res.status(200).json({ message: 'hola que tal' });
      
    } catch (error) {
      next(error);
    }
  }

  
);

module.exports = router;