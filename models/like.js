const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let result = {}
	result.data = await knex('liked').select('liked.product_id', 'product.name', 'product.price', 'product.status', 'product.thumbnail', 'store.account as store_account')
							.where('liked.user_id', req.session.user.id)
							.leftJoin('product', function(){
								this.on('liked.product_id', '=', 'product.id').on('liked.type', '=', 1)
							}).leftJoin('store', 'product.store_id', 'store.id').orderBy('liked.id', 'DESC')
	return result;
}

model.new = async function (req) {
	let obj = {
		'user_id': req.session.user.id,
		'type': 1,
		'product_id': req.query.product_id
	}
	let data = await knex('liked').select('id').where(obj).first()
	if (data) return false;
	await knex('liked').insert({
		...obj,
		create_at: knex.fn.now()
	})
	return await knex('liked').select('id').where(obj).first()
}

model.delete = async function(req) {
	return await knex('liked').where('id', req.params.like_id).del()
}

module.exports = model;