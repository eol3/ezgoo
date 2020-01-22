const knex = require('../config/database')
const f = require('../tools/fileio')
const password = require('../tools/password')
const { compressImage } = require('../tools/processImages.js');
var model = {}

model.getOne = async function (req) {
	let data = await knex('user').select('user.id', 'user.account', 'user.nickname', 'user_image.url as avatar').where({'user.id': req.params.user_id})
							.leftJoin('user_image', function(){
								this.on('user_image.user_id', '=', 'user.id').on('user_image.type', '=', 1)
							}).first()
	return data
}

model.getSessionOne = async function (user_id) {
	let data = await knex('user').select('user.id', 'account', 'nickname', 'user_image.url as avatar_url').where({'user.id': user_id})
							.leftJoin('user_image', function(){
								this.on('user_image.user_id', '=', 'user.id').on('user_image.type', '=', 1)
							}).first()
	if (data.avatar_url === null) data.avatar_url = ""
	return data
}

model.getRelateRole = async function (user_id, req) {
	let store_id = null
	if (req.query.store_id !== undefined) {
		store_id = req.query.store_id
	} else if (req.query.store_account !== undefined) {
		let store = await knex('store').select('id').where('account', req.query.store_account).first()
		store_id = store.id
	}
	let obj = await knex('relate_user_store')
							.select('store_id', 'group', 'role')
							.where({
								'user_id': user_id,
								'store_id': store_id
							})
	let role = {
		store_id: store_id,
		general: "guest"
	}
	for (let i in obj) {
		if (obj[i].group === "manage") {
			role.manage = obj[i].role
		} else if (obj[i].group === "general") {
			role.general = obj[i].role
		}
	}
	return role
}

// model.getSessionRelate = async function(req) {
// 	let store = await knex('store').where("account", req.query.store_id).first()
// 	return await knex('relate_user_store')
// 						.select('id', 'store_id', 'user_id', 'group', 'role')
// 						.where({
// 							'user_id': req.session.user.id,
// 							'store_id': store.id
// 						})
// }

model.getFullOne = async function (req) {
	let result = {}
	result = await knex('user').where({'id': req.params.user_id}).first()
	if (result === undefined) {
		const err = new Error();
		err.msg = "找不到使用者"
		throw err
		return false
	}
	delete result.password;
	let obj = {}
	obj = await knex('user_image').where({'user_id': result.id, type: 1}).first()
	if (obj) {
		result.avatar = obj
	}
	return result
}

model.save = async function (req) {
	if (req.body.password !== undefined) {
		if (req.body.password === req.body.check_password) {
			await knex('user').where({'id': req.params.user_id}).update({
				password: password.hash(req.body.password)
			})
		} else {
			const err = new Error
			err.msg = "密碼確認錯誤"
			throw err
		}
	}
	delete req.body.password
	delete req.body.check_password
	await knex('user').where({'id': req.params.user_id}).update({
		...req.body,
		update_at: knex.fn.now()
	})
	return model.getFullOne(req)
}

model.saveAvatar = async function (req) {
	if(req.file === undefined){
		let data = await knex('user_image').where({ user_id: req.params.user_id, type: 1 }).first()
		if(data){
			await f.delete_img('./public/avatar/' + data.filename)
			await knex('user_image').where({ id: data.id }).delete()
		}
		return false
	} else {
		req.file.size = await compressImage('./public/avatars/', req.file.filename, 100);
		 
		let data = await knex('user_image').where({ user_id: req.params.user_id, type: 1 }).first()

		if(data){
			let old_path = './public/avatars/' + data.filename
			await f.delete_img(old_path)
			await knex('user_image').where({ user_id: req.params.user_id, type: 1 })
				.update({
					filename: req.file.filename,
					url: req.app.locals.config.base_url + '/public/avatars/' + req.file.filename,
					size: req.file.size,
					update_by: req.session.user.id,
					update_at: knex.fn.now()
				})
		}else{
			await knex('user_image').insert({
				user_id: req.params.user_id,
				filename: req.file.filename,
				url: req.app.locals.config.base_url + '/public/avatars/' + req.file.filename,
				type: 1,
				size: req.file.size,
				create_by: req.session.user.id,
				create_at: knex.fn.now(),
				update_by: req.session.user.id,
				update_at: knex.fn.now(),
			})
		}
		
		return await knex('user_image').select('url as avatar_url').where({ user_id: req.params.user_id, type: 1 }).first()
	}
}

model.regist = async function (req) {
	let pass = req.body.password
	if (req.body.email.indexOf("/") >= 0 || req.body.phone.indexOf("/") >= 0){
		const err = new Error
		err.msg = "內含不合法字元"
		throw err
	}
	if (req.body.email !== "" && (req.body.email.indexOf("@") < 0 || req.body.email.indexOf(".") < 0)) {
		const err = new Error
		err.msg = "信箱格式錯誤"
		throw err
	}
	if(req.body.phone === '' && req.body.email === ''){
		const err = new Error
		err.msg = "帳號、手機號碼、E-mail必須輸入一項"
		throw err
	}
	if (pass === "") {
		const err = new Error
		err.msg = "密碼不能空白"
		throw err
	}
	if (pass.length < 6) {
		const err = new Error
		err.msg = "密碼必須超過6碼"
		throw err
	}
	let data = await knex('user').insert({
		phone: req.body.phone,
		email: req.body.email,
		password: password.hash(pass),
		create_at: knex.fn.now(),
		update_at: knex.fn.now()
	})
	if(!data){
		return false
	}else{
		await knex('cart').insert({
			'user_id': data[0],
			'content': req.body.cart,
			'update_at': knex.fn.now()
		})
		return await model.getSessionOne(data[0])
	}
}

model.check = async function (req) {
	if (req.body.account === "") return false
	let data = await knex('user').select('id', 'password')
					.where({'account': req.body.account})
					.orWhere({'email': req.body.account})
					.orWhere({'phone': req.body.account}).first()
	if(data === undefined || data === false){
		return false
	}
	if(password.validate(data.password, req.body.password)){
		return model.getSessionOne(data.id)
	}
	return false
}

model.getStore = async function (req) {
	let result = {}
	let query = knex('relate_user_store').select('relate_user_store.*', 'store.name as store_name', 'store.account as store_account')
							.leftJoin('store', 'relate_user_store.store_id', 'store.id')
							.where({'relate_user_store.user_id': req.session.user.id})
	if(req.query.role) {
		query.where({'relate_user_store.role': req.query.role})
		result.data = await query.orderBy('create_at', 'DESC')
	} else if(req.query.group){
		query.where({'relate_user_store.group': req.query.group})
		result.data = await query.orderBy('create_at', 'DESC')
	}
	result.total = 10
	return result
}

model.setRole = async function (req) {
	if(req.query.follow === "1") {
		await knex('relate_user_store').insert({
			user_id: req.session.user.id,
			store_id: req.query.store_id,
			group: "general",
			role: "follower",
			create_at: knex.fn.now()
		})
	} else if(req.query.follow == "0"){
		await knex('relate_user_store').where({
			user_id: req.session.user.id,
			store_id: req.query.store_id,
			role: "follower"
		}).delete()
	}
	return true
}

model.getRelateStore = async function(user_id) {
	return await knex('relate_user_store')
		.select('id', 'store_id', 'user_id', 'group', 'role')
		.where({'relate_user_store.user_id': user_id})
}

model.setCart = async function(req) {
	return await knex('cart').where('user_id', req.params.user_id).update({
		'content': req.body.cart,
		'update_at': knex.fn.now()
	})
}

model.getCart = async function(user_id) {
	let data = await knex('cart').select('content').where('user_id', user_id).first()
	return data["content"]
}

model.checkUnique = async function(req) {
	let query = knex('user')
	let result, sub_query = {}
	if (req.body.id !== '' && req.body.id !== undefined) {
		query.where('id', '!=', req.body.id)
	}
	if (req.body.account !== '' && req.body.account !== undefined) {
		sub_query = query.clone()
		result = await sub_query.where({'account': req.body.account}).first()
		if (result !== undefined) {
			const err = new Error
			err.msg = "帳號已有人使用"
			throw err
		}
	}
	if (req.body.email !== '' && req.body.email !== undefined) {
		sub_query = query.clone()
		result = await sub_query.where({'email': req.body.email}).first()
		if (result !== undefined) {
			const err = new Error
			err.msg = "E-mail已有人使用"
			throw err
		}
	}
	if (req.body.phone !== '' && req.body.phone !== undefined) {
		sub_query = query.clone()
		result = await sub_query.where({'phone': req.body.phone}).first()
		if (result !== undefined) {
			const err = new Error
			err.msg = "手機號碼已有人使用"
			throw err
		}
	}
	return
}

module.exports = model;