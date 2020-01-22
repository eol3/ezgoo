const knex = require('../config/database')
const f = require('../tools/fileio')
const { compressImage } = require('../tools/processImages.js');
var model = {}

model.getOne = async function (req) {
	let result = {}
	if (isNaN(req.params.id)) {
		result = await knex('store').where({'account': req.params.id}).first()
	} else {
		result = await knex('store').where({'id': req.params.id}).first()
	}
	if (result === undefined) {
		const err = new Error();
		err.msg = "找不到商店"
		err.redirect = true
		throw err
		return false
	}
	result.images = await knex('store_image').where({'store_id': result.id})
	for(let i in result.images){
		if(result.images[i].type === 1) {
			result.avatar = result.images[i]
			result.images.splice(i, 1)
		}
	}
	
	return result
}

model.getRole = async function (store_id, req) {
	let obj = await knex('relate_user_store')
							.select('store_id', 'group', 'role')
							.where({
								'user_id': req.session.user.id,
								'store_id': store_id
							})
	let role = {
		store_id: store_id
	}
	for (let i in obj) {
		if (obj[i].group === "manage") {
			role.manage = obj[i].role
		} else if (obj[i].group === "general") {
			role.general = obj[i].role
		}
	}
	req.session.user.role = role
	return role
}

model.save = async function (req) {
	let formData = req.body;
	let store = JSON.parse(formData.store)
	let store_image = JSON.parse(formData.store_image)
	let store_delete_image = JSON.parse(formData.store_delete_image)
	
	await knex('store')
		.where({'id': req.params.store_id})
		.update({
			...store,
			update_by: req.session.user.id,
			update_at: knex.fn.now(),
		})
	
	//將已上傳的圖片，進行壓縮，並按照順序，整理進陣列
  for(let i in req.files){
  	for(let j in store_image){
  		if(store_image[j].filename === undefined){
  			store_image[i].size = await compressImage('./public/images/', req.files[i].filename, false);
  			store_image[j].filename = req.files[i].filename
  			store_image[j].size = req.files[i].size
  			store_image[j].url = req.app.locals.config.base_url + '/public/images/' + req.files[i].filename
  			break;
  		}
  	}
  }
  
  for(let i in store_image){
		if(store_image[i].file !== undefined){
			await knex('store_image').insert({
				store_id: req.params.store_id,
				filename: store_image[i].filename,
				url: store_image[i].url,
				priority: store_image[i].priority,
				size: store_image[i].size,
				create_by: req.session.user.id,
				create_at: knex.fn.now(),
				update_by: req.session.user.id,
				update_at: knex.fn.now(),
	  	})
		}else{
			await knex('store_image').where({ id: store_image[i].id }).update({
				priority: store_image[i].priority,
				update_by: req.session.user.id,
		  	update_at: knex.fn.now(),
			})
		}
	}
	
	for(let i in store_delete_image){
		await f.delete_img('./public/images/' + store_delete_image[i].filename)
		await knex('store_image').where({ id: store_delete_image[i].id }).delete()
	}
	
	return true
	
}

model.saveAvatar = async function(req) {
	if(req.file === undefined){
		let data = await knex('store_image').where({ store_id: req.params.store_id, type: 1 }).first()
		if(data){
			await f.delete_img('./public/avatar/' + data.filename)
			await knex('store_image').where({ id: data.id }).delete()
		}
		return true;
	}
	
	req.file.size = await compressImage('./public/avatars/', req.file.filename, 100);
	
	let data = await knex('store_image').where({ store_id: req.params.store_id, type: 1 }).first()

	if(data){
		let old_path = './public/avatars/' + data.filename
		await f.delete_img(old_path)
		await knex('store_image').where({ store_id: req.params.store_id, type: 1 })
			.update({
				filename: req.file.filename,
				url: req.app.locals.config.base_url + '/public/avatars/' + req.file.filename,
				size: req.file.size,
				update_by: req.session.user.id,
				update_at: knex.fn.now()
			})
	}else{
		await knex('store_image').insert({
			store_id: req.params.store_id,
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
	
	return true
}

model.getUser = async function (req) {
	let result = {}
	let query = knex('relate_user_store').select('relate_user_store.role', 'relate_user_store.group', 'user.*')
							.leftJoin('user', 'relate_user_store.user_id', 'user.id')
							.where({'relate_user_store.store_id': req.params.store_id})
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

model.addUser = async function (req) {
	let user = await knex('user').where(function() {
		this.where('account', req.body.user).orWhere('email', req.body.user).orWhere('phone', req.body.user)
	}).first()
	if (user === undefined) {
		const err = new Error();
		err.msg = "找不到使用者"
		throw err
		return false
	}
	await knex('relate_user_store').insert({
		store_id: req.params.store_id,
		user_id: user.id,
		group: "manage",
		role: req.body.role,
		create_by: req.session.user.id,
		create_at: knex.fn.now()
	})
	req.query.group = "manage"
	return this.getUser(req)
}

model.delUser = async function (req) {
	await knex('relate_user_store').where('user_id', req.body.user_id).delete()
	req.query.group = "manage"
	return this.getUser(req)
}

module.exports = model;