const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'product'

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}
	
	result = await query.first();
	
	return result
}

