const { myCache } = require('./init.cache.js');
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();

const getInstanceWithCache = async (instanceId) => {
    const cacheKey = `instance:${instanceId}`;
    let cachedInstance = myCache.get(cacheKey);
    if (cachedInstance)  return cachedInstance;
    const data = await instanceServ.findOne(instanceId);
    myCache.set(cacheKey, JSON.parse(JSON.stringify(data)));
    return data;
  };

module.exports = { getInstanceWithCache };