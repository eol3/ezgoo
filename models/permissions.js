const knex = require('../config/database')
var model = {}

model.getList = async function (role, req) {
	let result = await knex('permissions').select("resource", "read", "write", "all").where({
		'store_id': req.query.store_id,
		'role': role
	})
	if (result.length === 0) {
		return {
			store_id: req.query.store_id,
			role: role
		}
	}
	return {
		store_id: req.query.store_id,
		role: role,
		permissions: result
	}
}

model.getRole = async function (req) {
	let obj = await knex('relate_user_store')
							.select('store_id', 'group', 'role')
							.where({
								'user_id': req.session.user.id,
								'store_id': req.query.store_id
							})
	let role = {
		store_id: req.query.store_id,
		general: "guest"
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

module.exports = model