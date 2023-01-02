const NodeCache = require( "node-cache" )
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 3800 })

module.exports = myCache