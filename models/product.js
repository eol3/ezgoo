const knex = require('../config/database')
const f = require('../tools/fileio')
const { thumbnailImage, compressImage } = require('../tools/processImages.js');
var model = {}

model.getList = async function (req) {
	let result = {}
	let limit = req.query.limit ? req.query.limit : 10;
	let offset = req.query.page ? (req.query.page - 1) * limit : 0;
	
	let query = knex('product').where({'product.store_id': req.query.store_id, 'product.status': 1})
	if(req.query.ids){
		let ids = [];
		ids = req.query.ids.split('-')
		query.whereIn('product.id', ids)
	}
	if(req.query.q){
		query.where('product.name', 'like', '%' + req.query.q + '%')
	}
	if(req.query.class){
		let classes = [];
		classes = req.query.class.split('-')
		query.leftJoin('relate_product_class', 'relate_product_class.product_id', 'product.id')
		query.whereIn('relate_product_class.class_id', classes)
	}
	if(req.query.spec_price){
		query.where('product.spec_price', '>', 0)
	}
	let total = query.clone();
	let data = query.clone();
	data.select('product.id','product.name','product.price','product.spec_price', 'product.thumbnail', 'product_spec.content as spec')
		.leftJoin('product_spec', 'product_spec.product_id', 'product.id')
		.orderBy('product.priority', 'DESC').limit(limit).offset(offset)
	if(req.session.user !== undefined) {
		if(req.query.user_id && req.session.user.id === parseInt(req.query.user_id)){
			data.select("liked.id as like_id").leftJoin('liked', function(){
				this.on('liked.user_id', '=', req.session.user.id)
					.on('liked.product_id', '=', 'product.id').on('liked.type', '=', 1)
			}).select("bookmarked.id as bookmark_id").leftJoin('bookmarked', function(){
				this.on('bookmarked.user_id', '=', req.session.user.id)
					.on('bookmarked.product_id', '=', 'product.id').on('bookmarked.type', '=', 1)
			})
		}
	}
	result.data = await data
	let obj = await total.count('product.id as total')
	result.total = obj[0].total
	return result
}

model.getOne = async function (req) {
	let result = {}
	let query = knex('product').select('product.*').where({'product.id': req.params.product_id, 'status': 1})
	if(req.session.user !== undefined) {
			query.select("liked.id as like_id").leftJoin('liked', function(){
				this.on('liked.user_id', '=', req.session.user.id)
					.on('liked.product_id', '=', 'product.id').on('liked.type', '=', 1)
			}).select("bookmarked.id as bookmark_id").leftJoin('bookmarked', function(){
				this.on('bookmarked.user_id', '=', req.session.user.id)
					.on('bookmarked.product_id', '=', 'product.id').on('bookmarked.type', '=', 1)
			})
	}
	result.product = await query.first();
	if (result.product === undefined) {
		const err = new Error
		err.msg = "查無此商品"
		throw err
	}
	
	result.product_image = await knex('product_image').where({'product_id': req.params.product_id});
	result.product.spec = []
	let obj = await knex('product_spec').select('content').where({'product_id': req.params.product_id}).first();
	if (obj !== undefined && obj.content !== "") {
		obj = JSON.parse(obj.content)
		result.product.spec = obj
	}
	
	return result
}

// 後台管理使用的model

model.getManageList = async function (req) {
	let result = {}
	let limit = req.query.limit ? req.query.limit : 10;
	let offset = req.query.page ? (req.query.page - 1) * limit : 0;
	let query = knex('product')
				.where({'store_id': req.query.store_id})
				.where('product.status', '>=', 0)
	if(req.query.class){
		let classes = [];
		classes = req.query.class.split('-')
		query.leftJoin('relate_product_class', 'relate_product_class.product_id', 'product.id')
		query.whereIn('relate_product_class.class_id', classes)
	}
	if(req.query.q){
		query.where('product.name', 'like', '%' + req.query.q + '%')
	}
	let total = query.clone();
	let data = query.clone();
	result.data = await data.select('product.*')
									.orderBy('product.priority', 'DESC').limit(limit).offset(offset)
	let obj = await total.count('product.id as total');
	result.total = obj[0].total
	return result
}

model.getManageOne = async function (req) {
	let result = {}
	result.product = await knex('product').where({'id': req.params.product_id}).first();
	if (result.product === undefined) {
		const err = new Error
		err.msg = "查無此商品"
		throw err
	}
	result.product.classes = await knex('relate_product_class')
																.join('class', 'class.id', 'relate_product_class.class_id')
																.where({'product_id': req.params.product_id});
	// result.product.spec = []
	let obj = await knex('product_spec').select('content').where({'product_id': req.params.product_id}).first();
	if (obj !== undefined && obj.content !== "") {
		result.product.spec = JSON.parse(obj.content);
	}
	result.product_image = await knex('product_image').where({'product_id': req.params.product_id});
	return result
}

model.setStatus = async function (req) {
	let formData = req.body
	let status = 0
	if(formData.status){
		status = 1
	}
	await knex('product').where('id', '=', req.params.product_id).update({ status: status })
	return true
}

model.delete = async function (req) {
	await knex('product').where('id', '=', req.params.product_id).update({ status: -1 })
	return true
}

model.changePriority = async function (req) {
	let formData = req.body
	for(let i in formData.productions){
		await knex('product').where('id', '=', formData.productions[i].id).update({ priority: formData.productions[i].priority })
	}
	return true
}

model.new = async function(req, res) {
	let formData = req.body;
	let product = JSON.parse(formData.product)
	let product_class = product.classes
	let product_spec = product.spec
	delete product.classes
	delete product.spec
	
	let result = await knex('product').insert({
		store_id: req.query.store_id,
		...product,
		create_by: req.session.user.id,
  	create_at: knex.fn.now(),
  	update_by: req.session.user.id,
  	update_at: knex.fn.now(),
	})
	
	let new_product_id = result[0]
	result = await knex('product').where({'store_id': req.query.store_id}).max('priority', {as: 'max_priority'})
	let max_priority = result[0].max_priority + 1
	await knex('product').where('id', '=', new_product_id).update({ priority: max_priority })
	
	//處理分類
	for (let i in product_class) {
		await knex('relate_product_class').insert({
			product_id: new_product_id,
			class_id: product_class[i].id,
			create_by: req.session.user.id,
			create_at: knex.fn.now(),
		})
	}
	
	//處理規格
	if (product_spec !== undefined) {
		await knex('product_spec').insert({
			product_id: new_product_id,
			content: JSON.stringify(product_spec),
			update_by: req.session.user.id,
			update_at: knex.fn.now(),
		})
	}
	
	//處理圖片
  for(let i in req.files){
  	if (i == 0) {
			await thumbnailImage('./public/images/', req.files[i].filename);
			let thumbnail_url = req.app.locals.config.base_url + '/public/thumbnail/' + req.files[i].filename
			await knex('product')
				.where({ 'id': new_product_id, 'store_id': req.query.store_id })
				.update({ thumbnail: thumbnail_url });
		} else {
  		req.files[i].size = await compressImage('./public/images/', req.files[i].filename, false);
		}
  	await knex('product_image').insert({
  		product_id: new_product_id,
  		filename: req.files[i].filename,
  		url: req.app.locals.config.base_url + '/public/images/' + req.files[i].filename,
  		priority: parseInt(i) + 1,
  		size: req.files[i].size,
  		create_by: req.session.user.id,
	  	create_at: knex.fn.now(),
	  	update_by: req.session.user.id,
	  	update_at: knex.fn.now(),
  	})
  }
	
	return true
}

model.save = async function(req, res) {
	let formData = req.body;
	let product = JSON.parse(formData.product)
	let product_class = product.classes
	delete product.classes
	let product_spec = product.spec
	delete product.spec
	let product_image = JSON.parse(formData.product_image)
	let product_delete_image = JSON.parse(formData.product_delete_image)
	
	let result = await knex('product')
		.where({ 'id': req.params.product_id, 'store_id': req.query.store_id })
		.update({
			...product,
			update_by: req.session.user.id,
  		update_at: knex.fn.now(),
		})
	
	//處理分類
	let old_class = await knex('relate_product_class').where({ product_id: req.params.product_id })
	for (let i in old_class) {
		let check = false
		for (let j in product_class) {
			if(product_class[j].id === old_class[i].class_id){
				check = true
				product_class.splice(j,1)
			}
		}
		if(!check){
			await knex('relate_product_class')
    				.where('id', old_class[i].id)
    				.del()
		}
	}
	for(let i in product_class){
		await knex('relate_product_class').insert({
			product_id: req.params.product_id,
			class_id: product_class[i].id,
			create_by: req.session.user.id,
			create_at: knex.fn.now(),
		})
	}
	
	//處理規格
	if (product_spec === undefined) {
		await knex("product_spec").where("product_id", req.params.product_id).delete()
	} else {
		let content = JSON.stringify(product_spec)
		await knex.raw("insert into `product_spec` (`content`, `product_id`, `update_at`, `update_by`) " +
				"values (?, ?, CURRENT_TIMESTAMP, ?) on DUPLICATE KEY " +
				"update `content`=?, `update_at`=CURRENT_TIMESTAMP, `update_by`=?",
				[content, req.params.product_id, req.session.user.id, content, req.session.user.id])
	}
	
  //將已上傳的圖片，按照順序，整理進陣列
  for(let i in req.files){
  	for(let j in product_image){
  		if(product_image[j].file !== undefined && product_image[j].filename === undefined){
  			product_image[j].filename = req.files[i].filename
  			product_image[j].size = req.files[i].size
  			product_image[j].url = req.app.locals.config.base_url + '/public/images/' + req.files[i].filename
  			break;
  		}
  	}
  }
  
  if (product_image.length === 0) {
  	await knex('product')
				.where({ 'id': req.params.product_id, 'store_id': req.query.store_id })
				.update({ thumbnail: '' });
  }
  
	for(let i in product_image){
		if (i == 0) {
			let result = await thumbnailImage('./public/images/', product_image[i].filename);
			if (!result) continue;
			let thumbnail_url = req.app.locals.config.base_url + '/public/thumbnail/' + product_image[i].filename
			await knex('product')
				.where({ 'id': req.params.product_id, 'store_id': req.query.store_id })
				.update({ thumbnail: thumbnail_url });
		}
		if(product_image[i].file !== undefined){
			product_image[i].size = await compressImage('./public/images/', product_image[i].filename, false);
			await knex('product_image').insert({
	  		product_id: req.params.product_id,
	  		filename: product_image[i].filename,
	  		url: product_image[i].url,
	  		priority: product_image[i].priority,
	  		size: product_image[i].size,
	  		create_by: req.session.user.id,
		  	create_at: knex.fn.now(),
		  	update_by: req.session.user.id,
		  	update_at: knex.fn.now(),
	  	})
		}else{
			await knex('product_image').where({ id: product_image[i].id }).update({
				priority: product_image[i].priority,
				update_by: req.session.user.id,
		  	update_at: knex.fn.now(),
			})
		}
	}
	
	for(let i in product_delete_image){
		await f.delete_img('./public/images/' + product_delete_image[i].filename)
		await f.delete_img('./public/thumbnail/' + product_delete_image[i].filename)
		await knex('product_image').where({ id: product_delete_image[i].id }).delete()
	}
	return true

}
model.newClass = async function(req, res) {
	let class_id_arr = req.body.class_id.split('-')
	console.log(class_id_arr)
	return true
}

module.exports = model;