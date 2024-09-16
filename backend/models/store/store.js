const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'store'

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (Object.hasOwn(condition, 'id')) {
		query.where({ 'id': condition.id })
	}
	
	if (Object.hasOwn(condition, 'account')) {
		query.where({ 'account': condition.account })
	}

	if (condition.status) {
		query.where({ 'status': condition.status })
	}
	
	// console.log(query.toString())
	result = await query.first();
	this.storeThumbnailUrlHandl(result)
	return result
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (Object.hasOwn(condition, 'id')) {
		query.where({ 'id': condition.id })
	}

	if (condition.status) {
		query.where({ 'status': condition.status })
	}
	
	if (condition.createBy) {
		query.where({ 'createBy': condition.createBy })
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
	
	return await query.update({
		...data,
		updateAt: knex.fn.now()
	})
}

model.storeThumbnailUrlHandl = function(store) {
	if (store.thumbnail) {
    store.thumbnail = process.env.BASE_URL + store.thumbnail
  }
}