const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let result = {}
	result.data = []
	let obj = await knex('specification').select("content").where('store_id', req.query.store_id).first()
	if (obj !== undefined && obj.content !== "") {
		result.data = JSON.parse(obj.content)
	}
	return result
}

model.new = async function (req) {
	let result = await knex('specification').insert({
		store_id: req.query.store_id,
		content: req.body.content,
		create_at: knex.fn.now(),
		create_by: req.session.user.id,
		update_at: knex.fn.now(),
		update_by: req.session.user.id
	})
	return result[0]
}

model.save = async function (req) {
	await knex.raw("insert into `specification` (`content`, `store_id`, `update_at`, `update_by`) " +
				"values (?, ?, CURRENT_TIMESTAMP, ?) on DUPLICATE KEY " +
				"update `content`=?, `update_at`=CURRENT_TIMESTAMP, `update_by`=?",
				[req.body.content, req.query.store_id, req.session.user.id, req.body.content, req.session.user.id])
	return true
}

model.delete = async function(req) {
	return await knex('specification').where('id', req.params.spec_id).del()
}

module.exports = model;