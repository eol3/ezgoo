const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'event'

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}

	if (condition.storeId) {
		query.where({ 'storeId': condition.storeId })
	}

	if (condition.status) {
		query.where({ 'status': condition.status })
	}
	// console.log(query.toString())
	result = await query.first();
	
	return result
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)

	attachCondition(condition, query)
	
	if (condition.sortBy && condition.orderBy) {
		query.orderBy(tableName + '.' + condition.sortBy, condition.orderBy)
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

model.getCount = async function(condition) {
	
	let result = {}
	let query = knex(tableName)
	
	attachCondition(condition, query)

	query.countDistinct(tableName + '.id as total')
	
	result = await query
	result = result[0]
	
	return result
}

function attachCondition(condition, query) {

	if (condition.storeId) {
		query.where({ 'storeId': condition.storeId })
	}

	if (condition.status) {
		query.where({ 'status': condition.status })
	}

}

model.create = async function (data) {
  
	return await knex(tableName).insert(data)
}

model.update = async function (condition, data) {
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}
	
	return await query.update({
		...data,
		updateAt: knex.fn.now()
	})
}

model.delete = async function (condition) {
	return await knex(tableName).where('id', condition.id).del()
}