const { models } = require('../libs/sequelize');
const axios = require('axios');
const { config } = require('../config/config');
const SessionService = require('../services/session.service');
const sessionServ = new SessionService();
const QueryService = require('../services/query.service');
const queyServ = new QueryService();

class PipelineService {
  constructor() {}

  async index( id, modules ) {
    const endpoint = `${config.modulePipeline}/index`;
    const callback = `${config.apiUrl}/api/v1/instances/0/sources/status/${id}`;
    const module_url = modules === 'text-extractor' ? config.moduleExtractor : config.moduleScraping;
    
    const indexData = {
      source_id: id,
      data_type: "TEXT",
      source_type: modules === 'text-extractor' ? "FILE" : "WEB",
      collections: [],
      module_name: modules,
      module_url: module_url,
      callback_url: callback
    }

    try {
        const response = await axios.post(endpoint, indexData );
        if (response.data.success) return response.data;
      } catch (error) {
        console.error('Error al enviar a INDEX:', error.response ? error.response.data : error.message);
      }

    return false;
  }

  async indexDelte( id ) {
    const endpoint = `${config.modulePipeline}/index/${id}`;

    try {
        const response = await axios.delete(endpoint );
        if (response.data.success) return response.data;
      } catch (error) {
        console.error('Error al enviar Delete INDEX:', error.response ? error.response.data : error.message);
      }

    return false
  }

  async addCollection( id, arrayDocument ) {
    const endpoint = `${config.modulePipeline}/index/collection`;
 
    const collectionData = {
        collection_id: id,
        document_ids: arrayDocument
      }

    try {
        const response = await axios.post(endpoint, collectionData );
        if (response.data.success) return response.data;
      } catch (error) {
        console.error('Error al enviar a AddCollection:', error.response ? error.response.data : error.message);
      }

    return false;
  }

  async addCollectionSource( data ) {
    const endpoint = `${config.modulePipeline}/collection/add-sources`;

    try {
        const response = await axios.post(endpoint, data );
        if (response.data.success) return response.data;
      } catch (error) {
        console.error('Error al enviar a AddCollectionSource:', error.response ? error.response.data : error.message);
      }

    return false;
  }

  async deleteCollectionSource( data ) {
    const endpoint = `${config.modulePipeline}/collection/del-sources`;

    try {
        const response = await axios.post(endpoint, data );
        if (response.data.success) return response.data;
      } catch (error) {
        console.error('Error al enviar a delete CollectionSource:', error.response ? error.response.data : error.message);
      }

    return false;
  }

  async collectionDelte( id ) {
    const endpoint = `${config.modulePipeline}/index/collection/${id}`;

    try {
        const response = await axios.delete(endpoint );
        if (response.data.success) return response.data;
      } catch (error) {
        console.error('Error al enviar Delete Collection:', error.response ? error.response.data : error.message);
      }

    return false
  }

  async getSessionName( id, msgUser, msgAssistant ) {
    const endpoint = `${config.modulePipeline}/qa/session-name`;
    let name = "" 

    const data = {
        history: [
          {
            history: [
              {
                message: msgUser,
                message_type: "user"
              },
              {
                message: msgAssistant,
                message_type: "assistant"
              }
            ]
          }
        ]
      }
      
    try {
      const response = await axios.post(endpoint, data );
      if (response.status === 200) name = response.data.name;
      await sessionServ.update({ id: id, name: name });
    } catch (error) {
      console.error('Error al enviar session name:', error.response ? error.response.data : error.message);
    }

    return name;
  }

  async getPipeline( msg ) {
    const endpoint = `${config.modulePipeline}/qa/v1`;

    // const data = {
    //     message: "string",
    //     history: [
    //       {
    //         message: "string",
    //         message_type: "system"
    //       }
    //     ],
    //     prompt: {
    //       system_prompt: "string",
    //       task_prompt: "string",
    //       include_datetime: true,
    //       include_citations: true,
    //       use_language_hint: false,
    //       language: "English"
    //     },
    //     rephrase: {
    //       always_rephrase: false,
    //       prompt_rephrase: ""
    //     },
    //     retriever: {
    //       rerank: false,
    //       llm_chunk_filter: false,
    //       num_to_retrieve: 10,
    //       include_title: false,
    //       include_web_search: false,
    //       search_type: "HYBRID"
    //     },
    //     filters: {}
    //   }

    // try {
    // const response = await axios.post(endpoint, data );
    // if (response.status === 200) return response.data;
    // } catch (error) {
    // console.error('Error al enviar session name:', error.response ? error.response.data : error.message);
    // }

    return "QA";
  }

  async qa( data ) {
    const endpoint = `${config.modulePipeline}/qa`;

    const dataPipeline = {
      message: data.question,
      filters: {
        document_ids: [],
        collection_ids: data.collections
      },
      history: data.history,
      prompts: {
        system_prompt: data.prompts.system_prompt,
        task_prompt: data.prompts.task_prompt,
        rephrase_prompt: data.prompts.rephrase_prompt
      },
      config: {
        always_rephrase: true,
        include_datetime: true,
        include_citations: true,
        use_language_hint: true, //false
        language: "Spanish"
      },
      retriever: {
        rerank: false,
        llm_chunk_filter: true,
        num_to_retrieve: 10,
        include_title: false,
        include_web_search: false,
        search_type: "HYBRID"
      }
    }
    
    try {
      const response = await axios.post(endpoint, dataPipeline );
      if (response.status === 200) return response.data;

    } catch (error) {
      console.error('Error al enviar QA:', error.response ? error.response.data : error.message);
    }

    return false;
  }
  
  async search( id, msg ) {
    const endpoint = `${config.modulePipeline}/search`;

    const data = {
        message: "string",
        history: [
          {
            message: "string",
            message_type: "system"
          }
        ],
        prompt: {
          system_prompt: "string",
          task_prompt: "string",
          include_datetime: true,
          include_citations: true,
          use_language_hint: false,
          language: "English"
        },
        rephrase: {
          always_rephrase: false,
          prompt_rephrase: ""
        },
        retriever: {
          rerank: false,
          llm_chunk_filter: false,
          num_to_retrieve: 10,
          include_title: false,
          include_web_search: false,
          search_type: "HYBRID"
        },
        filters: {}
      }
      
    try {
    const response = await axios.post(endpoint, data );
    if (response.status === 200) return response.data;

    } catch (error) {
    console.error('Error al enviar Search:', error.response ? error.response.data : error.message);
    }

    return false;
  }

  async generate( id, msg ) {
    const endpoint = `${config.modulePipeline}/generate`;

    const data = {
        message: "string",
        history: [
          {
            message: "string",
            message_type: "system"
          }
        ],
        prompt: {
          system_prompt: "string",
          task_prompt: "string",
          include_datetime: true,
          include_citations: true,
          use_language_hint: false,
          language: "English"
        },
        rephrase: {
          always_rephrase: false,
          prompt_rephrase: ""
        },
        retriever: {
          rerank: false,
          llm_chunk_filter: false,
          num_to_retrieve: 10,
          include_title: false,
          include_web_search: false,
          search_type: "HYBRID"
        },
        filters: {}
      }
      
    try {
    const response = await axios.post(endpoint, data );
    if (response.status === 200) return response.data;

    } catch (error) {
    console.error('Error al enviar Search:', error.response ? error.response.data : error.message);
    }

    return false;
  }

}

module.exports = PipelineService;