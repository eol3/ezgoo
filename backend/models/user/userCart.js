const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'userCart'

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (condition.userId) {
		query.where({ 'userId': condition.userId })
	}
	
	if (condition.storeId) {
		query.where({ 'storeId': condition.storeId })
	}
	
	// console.log(query.toString())
	result = await query.first();
	
	return result
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (condition.userId) {
		query.where({ 'userId': condition.userId })
	}
	
	if (condition.storeId) {
		query.where({ 'storeId': condition.storeId })
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

model.create = async function (data) {
	return await knex(tableName).insert(data)
}

model.update = async function (condition, data) {
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}
	
	if (condition.userId) {
		query.where({ 'userId': condition.userId })
	}
	
	if (condition.storeId) {
		query.where({ 'storeId': condition.storeId })
	}
	
	return await query.update({
		...data,
		updateAt: knex.fn.now()
	})
}