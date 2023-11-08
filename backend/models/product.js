const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'product'

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (Object.hasOwn(condition, 'id')) {
		query.where({ 'id': condition.id })
	}
	// console.log(query.toString())
	result = await query.first();
	
	return result
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (Object.hasOwn(condition, 'id')) {
		query.where({ 'id': condition.id })
	}
	
	if (condition.sortBy && condition.orderBy) {
		query.orderBy(condition.sortBy, condition.orderBy)
	}
	
	if (typeof condition.limit !== 'undefined') {
		query.limit(condition.limit, {skipBinding: true})
	}
	if (condition.offset) {
		query.offset(condition.offset, {skipBinding: true})	
	}
	
	// console.log(query.toString())
	result = await query
	
	return result
}

