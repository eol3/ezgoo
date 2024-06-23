const knex = require(process.cwd() + '/database/init').knex

var model = {}
module.exports = model
var tableName = 'user'

model.getOne = async function (condition) {
	
	let result = {}
	let query = knex(tableName)
	
	if (Object.hasOwn(condition, 'id')) {
		query.where({ 'id': condition.id })
	}
	
	if (Object.hasOwn(condition, 'email')) {
		query.where({ 'email': condition.email })
	}
	
	return await query.first()
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

model.checkEmailCode = async function (condition) {
	const now = new Date(+new Date() + 8 * 3600 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '')
	let query = knex('emailVerifyCode').where({
		'email': condition.email,
		'code': condition.code,
	}).andWhere(function() {
	  this.where('expireAt	', '>', now)
	})
	
	return await query.first()
}

model.verifyEmailCode = async function (condition) {
	return await knex('emailVerifyCode')
		.where({ 'id': condition.id })
		.update({
			verify: 1
		})
}

model.generatekEmailCode = async function (data) {
	let code = '';
	let num = Math.floor(Math.random()*9)+1;
	code = num.toString()
	for(let i=0; i<5; i++) {
		let num = Math.floor(Math.random()*9)+1;
		code += num.toString()
	}
	
	let minutesToAdd = 20;
	let currentDate = new Date(+new Date() + 8 * 3600 * 1000);
	let futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
	expire = futureDate.toISOString().replace(/T/, ' ').replace(/\..+/, '')
	
	await knex('emailVerifyCode').insert({
		...data,
		code: code,
		createAt: knex.fn.now(),
		expireAt: expire,
	})
	
	return code
}

model.checkEmailCodeCount = async function (condition) {
	let result = await knex('emailVerifyCode')
		.where({ 'email': condition.email })
		.orderBy('createAt', 'desc').first()
	if (!result) return true
	let currentDate = new Date(+new Date() + 8 * 3600 * 1000);
	let limitDateTime = new Date(result.createAt)
	limitDateTime = limitDateTime.getTime() + ( 8 * 3600 * 1000 ) + 30000 // 加時區 加30秒
	limitDateTime = new Date(limitDateTime)
	if (limitDateTime > currentDate) {
		return false
	} else {
		return true
	}
	
}

model.addEmailErrorLog = async function (data) {
	return await knex('emailVerifyErrorLog').insert({
		...data,
		createAt: knex.fn.now()
	})
}