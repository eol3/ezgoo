const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let result = {}
	result.data = await knex('promotions').select("id", "type", "name", "describe", "content").where({'store_id': req.query.store_id, 'status': 1})
	let obj = await knex('promotions').where({'store_id': req.query.store_id, 'status': 1}).count('id as total');
	result.total = obj[0].total
	return result
}

model.getManageList = async function (req) {
	let result = {}
	result.data = await knex('promotions').where('store_id', req.query.store_id)
	let obj = await knex('promotions').where('store_id', req.query.store_id).count('id as total');
	result.total = obj[0].total
	return result
}

model.getManageOne = async function (req) {
	return await knex('promotions').where('id', req.params.prom_id).first()
}

model.setStatus = async function (req) {
	let formData = req.body
	let status = 0
	if(formData.status){
		status = 1
	}
	await knex('promotions').where('id', '=', req.params.prom_id).update({ status: status })
	return true
}

model.new = async function (req) {
	await knex('promotions').insert({
		store_id: req.query.store_id,
		...req.body,
		create_at: knex.fn.now(),
		create_by: req.session.user.id,
		update_at: knex.fn.now(),
		update_by: req.session.user.id
	})
}

model.save = async function (req) {
	await knex('promotions')
		.where("id", req.params.prom_id)
		.update({
			...req.body,
			update_at: knex.fn.now(),
			update_by: req.session.user.id
		})
}

module.exports = model;