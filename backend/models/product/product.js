const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'product'
var selectObj = false

// 先不要用這個 設定selectObj之後在其他地方使用會沿用
model.setRoleFilter = function(sessionUser) {
	if (!sessionUser || !sessionUser.currentStore || !sessionUser.currentStore.role) {
		// 未登入 或 未取得商店關係
		selectObj = [tableName+'.id', tableName+'.storeId',
			tableName+'.name', tableName+'.describe',
			tableName+'.thumbnail', tableName+'.options']
		return
	}
	let role = sessionUser.currentStore.role
	if (role === 'owner') {
		selectObj = false
	} else if (role === 'editor') {

	} else if (role === 'guest') {

	}
}

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)

	if (selectObj) {
		query.select(selectObj)
	}
	
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

	if (selectObj) {
		query.select(selectObj)
	} else {
		query.select(tableName + '.*')
	}

	if (condition.ids) {
		query.where(function() {
			for (let item of condition.ids) {
				this.orWhere({ 'id': item })
			}
		})
	}
	
	if (condition.categoris || condition.word) {
		query.distinct(tableName + '.id')
	}

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

	if (condition.ids) {
		query.where(function() {
			for (let item of condition.ids) {
				this.orWhere({ 'id': item })
			}
		})
	}

	if (condition.storeId) {
		query.where({ 'storeId': condition.storeId })
	}

	if (condition.account) {
		query.where({ 'account': condition.account })
	}
	
	if (condition.word) {
		query.whereLike('name', '%'+condition.word+'%')
	}

	if (condition.status) {
		query.where({ 'status': condition.status })
	}

	if (condition.categoris) {
		query.join('productCategoriesOnProducts', 'product.id', 'productCategoriesOnProducts.productId')
		query.where(function() {
			for (let item of condition.categoris) {
				this.orWhere({ 'productCategoriesOnProducts.productCategoryId': item })
			}
		})
	}

}

model.create = async function (data) {
	
	if (data.options) {
    data.options = JSON.stringify(data.options)
  }
  
	return await knex(tableName).insert(data)
}

model.update = async function (condition, data) {
	let query = knex(tableName)
	
	if (condition.id) {
		query.where({ 'id': condition.id })
	}
	
	if (data.options) {
    data.options = JSON.stringify(data.options)
  }
	
	return await query.update({
		...data,
		updateAt: knex.fn.now()
	})
}

model.delete = async function (condition) {
	return await knex(tableName).where('id', condition.id).del()
}

model.plusOne = async function (condition, data) {
	let query = knex(tableName).increment(data).where({ id: condition.id })
	return await query
}