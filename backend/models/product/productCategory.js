const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'productCategory'

model.getOne = async function (condition) {
	
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}
		
	return await query.first()
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
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

	if (condition.parentId) {
		query.where({ 'parentId': condition.parentId })
	}
	
	let result = await query.update({
		...data,
		updateAt: knex.fn.now()
	})

	// console.log(query.toString())
	return result
}

model.delete = async function (condition) {
	return await knex(tableName).where('id', condition.id).del()
}