const knex = require('../config/database')
const f = require('../tools/fileio')
const { compressImage } = require('../tools/processImages.js');
var model = {}

model.getList = async function (req) {
	let result = {}
	let limit = req.query.limit ? req.query.limit : 10;
	let offset = req.query.page ? (req.query.page - 1) * limit : 0;

	result.data = await knex.select('post.id','post.content', 'post_image.url as image_url').from('post')
										.where({'store_id': req.query.store_id, 'post.status': 1})
										.leftJoin('post_image', function(){
											this.on('post.id', '=', 'post_image.post_id').on('post_image.priority', '=', 1)
										})
										.orderBy('post.create_at', 'DESC')
										.limit(limit).offset(offset)
	let obj = await knex('post').where({'store_id': req.query.store_id, 'post.status': 1}).count('id as total');
	result.total = obj[0].total
	return result
}

model.getOne = async function (req) {
	let result = {}
	result.post = await knex('post').where({'id': req.params.post_id, 'status': 1}).first();
	result.post_image = await knex('post_image').where({'post_id': req.params.post_id});
	return result
}

model.getManageList = async function (req) {
	let result = {}
	let limit = req.query.limit ? req.query.limit : 10;
	let offset = req.query.page ? (req.query.page - 1) * limit : 0;
	result.data = await knex.select('post.*', 'post_image.url as image_url').from('post')
										.where({'store_id': req.query.store_id})
										.where('post.status', '>=', 0)
										.leftJoin('post_image', function(){
											this.on('post.id', '=', 'post_image.post_id').on('post_image.priority', '=', 1)
										})
										.orderBy('post.create_at', 'DESC')
										.limit(limit).offset(offset)
	let obj = await knex('post')
							.where({'store_id': req.query.store_id})
							.where('post.status', '>=', 0)
							.count('id as total');
	result.total = obj[0].total
	return result
}

model.getManageOne = async function (req) {
	let result = {}
	result.post = await knex('post').where({'id': req.params.post_id}).first();
	result.post_image = await knex('post_image').where({'post_id': req.params.post_id});
	return result
}

model.setStatus = async function (req) {
	let formData = req.body
	let status = 0
	if(formData.status){
		status = 1
	}
	await knex('post').where('id', '=', req.params.post_id).update({ status: status })
	return true
}
model.setTop = async function (req) {
	let formData = req.body
	let top = 0
	if(formData.top){
		top = 1
	}
	await knex('post').where('id', '=', req.params.post_id).update({ top: top })
	return true
}


model.new = async function(req, res) {
	let formData = req.body;
	let post = JSON.parse(formData.post)
	
	let result = await knex('post').insert({
		store_id: req.query.store_id,
		...post,
		create_by: req.session.user.id,
  	create_at: knex.fn.now(),
  	update_by: req.session.user.id,
  	update_at: knex.fn.now(),
	})
	
	let new_post_id = result[0]
	
	//處理圖片
  for(let i in req.files){
  	await compressImage('./public/images/', req.files[i].filename, false);
  	await knex('post_image').insert({
  		post_id: new_post_id,
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
	let post = JSON.parse(formData.post)
	let post_image = JSON.parse(formData.post_image)
	let post_delete_image = JSON.parse(formData.post_delete_image)
	
	let result = await knex('post')
		.where({ 'id': req.params.post_id, 'store_id': req.query.store_id })
		.update({
			...post,
			update_by: req.session.user.id,
  		update_at: knex.fn.now(),
		})
  //將已上傳的圖片，進行壓縮，並按照順序，整理進陣列
  for(let i in req.files){
  	for(let j in post_image){
  		if(post_image[j].file !== undefined && post_image[j].filename === undefined){
  			console.log(post_image[j])
  			await compressImage('./public/images/', req.files[i].filename, false);
  			post_image[j].filename = req.files[i].filename
  			post_image[j].size = req.files[i].size
  			post_image[j].url = req.app.locals.config.base_url + '/public/images/' + req.files[i].filename
  			break;
  		}
  	}
  }
  
	for(let i in post_image){
		if(post_image[i].file !== undefined){
			await knex('post_image').insert({
	  		post_id: req.params.post_id,
	  		filename: post_image[i].filename,
	  		url: post_image[i].url,
	  		priority: post_image[i].priority,
	  		size: post_image[i].size,
	  		create_by: req.session.user.id,
		  	create_at: knex.fn.now(),
		  	update_by: req.session.user.id,
		  	update_at: knex.fn.now(),
	  	})
		}else{
			await knex('post_image').where({ id: post_image[i].id }).update({
				priority: post_image[i].priority,
				update_by: req.session.user.id,
		  	update_at: knex.fn.now(),
			})
		}
	}
	
	for(let i in post_delete_image){
		await f.delete_img('./public/images/' + post_delete_image[i].filename)
		await knex('post_image').where({ id: post_delete_image[i].id }).delete()
	}
	return true

}

model.delete = async function (req) {
	await knex('post').where('id', '=', req.params.post_id).update({ status: -1 })
	return true
}

module.exports = model;