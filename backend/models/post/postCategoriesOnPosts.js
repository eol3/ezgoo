const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'postCategoriesOnPosts'

model.getOne = async function (condition) {
	
	let query = knex(tableName)

	if (!condition) return await query
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}

	if (condition.postId) {
		query.where({ 'postId': condition.postId })
	}

	if (condition.postCategoryId) {
		query.where({ 'postCategoryId': condition.postCategoryId })
	}
		
	return await query.first()
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)

	if (!condition) return await query
	
	if (condition.postId) {
		query.where({ 'postId': condition.postId })
	}

	if (condition.postCategoryId) {
		query.where({ 'postCategoryId': condition.postCategoryId })
	}
	
	if (condition.sortBy && condition.orderBy) {
		query.orderBy(condition.sortBy, condition.orderBy)
	}
	
	// console.log(query.toString())
	result = await query
	
	return result
}

model.getCount = async function(condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (condition.postId) {
		query.where({ 'postId': condition.postId })
	}
	
	if (condition.postCategoryId) {
		query.where({ 'postCategoryId': condition.postCategoryId })
	}

	query.countDistinct(tableName + '.id as total')
	
	result = await query
	result = result[0]
	
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

model.delete = async function (condition) {
	let query = knex(tableName)

	if (condition.id) {
		query.where({ 'id': condition.id })
	}
	
	if (condition.postId) {
		query.where({ 'postId': condition.postId })
	}

	if (condition.postCategoryId) {
		query.where({ 'postCategoryId': condition.postCategoryId })
	}
	
	if (condition.postCategoryIds) {
		query.whereIn('postCategoryId', condition.postCategoryIds)
	}
	
	return await query.del()
}