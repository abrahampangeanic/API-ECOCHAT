const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 3600 }); // TTL de 1 hora (3600 segundos)


module.exports = { myCache };