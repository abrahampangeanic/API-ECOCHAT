const { myCache } = require('./init.cache.js');
const AssistantService = require('../services/assistant.service');
const assistantServ = new AssistantService();

const getAssistantWithCache = async (assistantId) => {
    const cacheKey = `assistant:${assistantId}`;
    let cachedAssistant = myCache.get(cacheKey);
    if (cachedAssistant)   return cachedAssistant;
    const data = await assistantServ.findOneFull(assistantId);
    myCache.set(cacheKey, JSON.parse(JSON.stringify(data)));
    return data;
  };

module.exports = { getAssistantWithCache };