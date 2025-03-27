const { myCache } = require('./init.cache.js');
const sourcesService = require('../services/source.service');
const sourceServ = new sourcesService();

const getLanguagesWithCache = async (instanceId) => {
  const cacheKey = `languages:${instanceId}`;
  let cachedLanguages = myCache.get(cacheKey);
  if (cachedLanguages)  return cachedLanguages;
  const data = await sourceServ.findDistinctLanguagesByInstanceId(instanceId);
  myCache.set(cacheKey, JSON.parse(JSON.stringify(data)));
  return data;
};

module.exports = { getLanguagesWithCache };