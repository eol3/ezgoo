const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'productVariant'

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
		query.where({ 'productVariant.id': condition.id })
	}

	if (condition.ids) {
		query.where(function() {
			for (let item of condition.ids) {
				this.orWhere({ 'productVariant.id': item })
			}
		})
	}

	if (condition.storeId) {
		query.where({ 'productVariant.storeId': condition.storeId })
	}

	if (condition.productId) {
		query.where({ 'productVariant.productId': condition.productId })
	}
	
	if (condition.status) {
		query.select(tableName + '.*')
		query.select('product.status')
		query.join('product', 'product.id', tableName + '.productId')
		query.where({ 'product.status': condition.status })
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
	
	if (data.productOption) {
    data.productOption = JSON.stringify(data.productOption)
  }
  
	return await knex(tableName).insert(data)
}

model.update = async function (condition, data) {
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}
	
	if (condition.productId) {
		query.where({ 'productId': condition.productId })
	}
	
	if (data.productOption) {
    data.productOption = JSON.stringify(data.productOption)
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

	return await query.del()
}