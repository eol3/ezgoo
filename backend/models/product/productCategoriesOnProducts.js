const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'productCategoriesOnProducts'

model.getOne = async function (condition) {
	
	let query = knex(tableName)

	if (!condition) return await query
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}

	if (condition.productId) {
		query.where({ 'productId': condition.productId })
	}

	if (condition.productCategoryId) {
		query.where({ 'productCategoryId': condition.productCategoryId })
	}
		
	return await query.first()
}

model.getList = async function (condition) {
	
	let result = {}
	let query = knex(tableName)

	if (!condition) return await query
	
	if (condition.productId) {
		query.where({ 'productId': condition.productId })
	}

	if (condition.productCategoryId) {
		query.where({ 'productCategoryId': condition.productCategoryId })
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

	if (condition.productStatus) {
		query.join('product', 'product.id', 'productCategoriesOnProducts.productId')
		query.where({ 'product.status': condition.productStatus })
	}
	
	if (condition.productId) {
		query.where({ 'productId': condition.productId })
	}
	
	if (condition.productCategoryId) {
		query.where({ 'productCategoryId': condition.productCategoryId })
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
	
	if (condition.productId) {
		query.where({ 'productId': condition.productId })
	}

	if (condition.productCategoryId) {
		query.where({ 'productCategoryId': condition.productCategoryId })
	}
	
	if (condition.productCategoryIds) {
		query.whereIn('productCategoryId', condition.productCategoryIds)
	}
	
	return await query.del()
}