const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let result = {}
	let limit = req.query.limit ? req.query.limit : 10;
	let offset = req.query.page ? (req.query.page - 1) * limit : 0;
	result.data = await knex('order').where({'user_id': req.session.user.id}).where('status', '>', 0).orderBy("create_at", "desc").limit(limit).offset(offset)
	let obj = await knex('order').where({'user_id': req.session.user.id}).where('status', '>', 0).count('id as total')
	result.total = obj[0].total
	return result
}

model.getOne = async function(req) {
	let result = {}
	result = await knex('order').where({'id': req.params.order_id}).where('status', '>', 0).first();
	if(result){
		result.store = await knex('store').select('store.id', 'store.account', 'store.name', 'store_image.url as avatar')
										.leftJoin('store_image', function(){
											this.on('store_image.store_id', '=', 'store.id').on('store_image.type', '=', 1)
										})
										.where({'store.id': result.store_id})
										.first();
		result.items = await knex('order_item').select('order_item.*', 'product.thumbnail as item_image')
										.leftJoin('product', 'order_item.item_id', 'product.id')
										.where({'order_id': req.params.order_id})
	}else{
		result.items = []
	}
  return result
}

model.getManageList = async function(req) {
	let result = {}
	let limit = req.query.limit ? req.query.limit : 10;
	let offset = req.query.page ? (req.query.page - 1) * limit : 0;
	let query = knex('order').select('order.*')
				.where({'order.store_id': req.query.store_id})
	if (req.query.start_at) {
		query.where("order.create_at", ">=", req.query.start_at)
	}
	if (req.query.end_at) {
		query.where("order.create_at", "<=", req.query.end_at + " 23:59:59")
	}
	if (req.query.status) {
		query.where("order.status", "=", req.query.status)
	} else {
		query.where('order.status', '>', 0)
	}
	if (req.query.user && req.query.user !== '') {
		query.leftJoin('user', 'user.id', 'order.user_id')
		query.where(function(){
			this.where('user.account', 'like', '%' + req.query.user + '%')
				.orWhere('user.email', 'like', '%' + req.query.user + '%')
				.orWhere('user.phone', 'like', '%' + req.query.user + '%')
		})
	}
	let total = query.clone();
	let data = query.clone();
	result.data = await data.orderBy("order.create_at", "desc")
	let obj = await total.count('order.id as total');
	result.total = obj[0].total
	return result
}

model.getManageListByItem = async function(req) {
	let result = {}
	result = await knex.select('order_item.*').sum('item_number as number').from('order').where({'store_id': req.query.store_id})
										.where("order.create_at", ">=", req.query.start_at)
										.where("order.create_at", "<=", req.query.end_at)
										.where(function(){
											this.where('order.status', 1).orWhere('order.status', 2)
										})
										.join('order_item', 'order_item.order_id', 'order.id')
										.groupBy('item_id')
	return result
}

model.getManageOne = async function(req) {
	let result = {}
	result = await knex('order').where({'order.id': req.params.order_id}).where('status', '>', 0).first();
	result.user = await knex('user').select('user.id', 'user.account', 'user.name', 'user.phone', 'user.email').where({'id': result.user_id}).first();
	result.items = await knex('order_item').select('order_item.*', 'product.thumbnail as item_image')
									.leftJoin('product', 'order_item.item_id', 'product.id')
									.where({'order_id': req.params.order_id})
  return result
}

model.new = async function(req) {
	if (req.query.store_id !== 2) {
		if (req.session.user.account === "test_owner" 
			|| req.session.user.account === "test_editor" 
			|| req.session.user.account === "test_picker" 
			|| req.session.user.account === "test_guest") {
			const err = new Error("Some Error!");
			err.msg = "無法使用此特定帳號在此商店下單"
			throw err
		}
	}
	let product = JSON.parse(req.body.product)
	let payment_status = 1
	if (req.body.payment === 3 && req.body.recieve === 3) {
		payment_status = 3
	}
	let result = await knex('order').insert({
		store_id: req.query.store_id,
		user_id: req.session.user.id,
		status: 1,
		type: 0,
		payment: req.body.payment,
		payment_status: payment_status,
		recieve: req.body.recieve,
		create_by: req.session.user.id,
		create_at: knex.fn.now(),
		update_by: req.session.user.id,
		update_at: knex.fn.now(),
	})
	let new_order_id = result[0]
	if(product.length === 0){
		const err = new Error("Some Error!");
		err.msg = "尚無項目"
		throw err
	}
	let total = 0
	for (let i in product) {
		let price = product[i].price;
		if (product[i].spec_price !== undefined && product[i].spec_price !== 0) {
			price = product[i].spec_price
		}
		total += price
		await knex('order_item').insert({
			order_id: new_order_id,
			item_id: product[i].id,
			item_name: product[i].name,
			item_price: price,
			item_number: product[i].number,
			item_spec: JSON.stringify(product[i].spec),
			type: 1
		})
	}
	await knex('order').where("id", new_order_id).update({'total': total})

	if (req.body.user) {
		await knex('user').where("id", req.session.user.id).update(req.body.user)
	}

	let user = await knex('user').where("id", req.session.user.id).first()
	let store = await knex('store').where("id", req.query.store_id).first()
	//發送e-mail
	let order_url = req.app.locals.config.base_url + "/user/"
	if (user.account === "") order_url += user.account + "/order"
	else order_url += user.id + "/order"
	let mail_title = "[訂單成立]訂單單號:" + new_order_id
	let mail_html = "<h3>" + mail_title + "</h3>"
								+ "<p><a href='" + order_url + "'>點此查看訂單</a></p>"
								+ "<p>感謝您的下單</p>"
								+ "<i>" + store.name + " 敬上</i><hr>"
								+ "<center><a href='" + req.app.locals.config.base_url +"'>ezgoo</a></center>"
	const { send } = require("../tools/mail.js")
	send(user.email, mail_title, mail_html).catch(console.error);

	return true
}

model.setStatus = async function(req) {
	await knex('order').where('id', '=', req.params.order_id).update({ status: req.body.status })
	if (req.body.status == 4) {
		let obj = await knex('order').select('user.id as user_id', 'user.account as user_account', 'user.email as user_email', 'store.name as store_name').where('order.id', '=', req.params.order_id)
								.leftJoin('user', 'user.id', 'order.user_id')
								.leftJoin('store', 'store.id', 'order.store_id').first()
		let order_url = req.app.locals.config.base_url + "/user/"
		if (obj.user_account === "") order_url += obj.user_account + "/order"
		else order_url += obj.user_id + "/order"
		let mail_title = "[可取貨]訂單單號:" + req.params.order_id
		let mail_html = "<h3>" + mail_title + "</h3>"
									+ "<p><a href='" + order_url + "'>點此查看訂單</a></p>"
									+ "<p>感謝您的購買，請盡快前往取貨</p>"
									+ "<i>" + obj.store_name + " 敬上</i><hr>"
									+ "<center><a href='" + req.app.locals.config.base_url +"'>ezgoo</a></center>"
		const { send } = require("../tools/mail.js")
		send(obj.user_email, mail_title, mail_html).catch(console.error);
	}
	return true
}

model.setCancel = async function(req) {
	await knex('order').where('id', '=', req.params.order_id).update({ status: 0 })
	return true
}

module.exports = model;