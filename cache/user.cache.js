const { myCache } = require('./init.cache.js');
const UserService = require('../services/user.service');
const userServ = new UserService();

const getUserWithCache = async (userId) => {
    const cacheKey = `user:${userId}`;
    let cachedUser = myCache.get(cacheKey);
    if (cachedUser)  return cachedUser;
    const data = await userServ.findOneWithPermissions(userId);
    myCache.set(cacheKey, JSON.parse(JSON.stringify(data)));
    return data;
};

module.exports = { getUserWithCache };