const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let result = {}
	result.data = await knex('bookmarked').select('bookmarked.product_id', 'product.name', 'product.price', 'product.status', 'product.thumbnail', 'store.account as store_account')
							.where('bookmarked.user_id', req.session.user.id)
							.leftJoin('product', function(){
								this.on('bookmarked.product_id', '=', 'product.id').on('bookmarked.type', '=', 1)
							}).leftJoin('store', 'product.store_id', 'store.id').orderBy('bookmarked.id', 'DESC')
	return result;
}

model.new = async function (req) {
	let obj = {
		'user_id': req.session.user.id,
		'type': 1,
		'product_id': req.query.product_id
	}
	let data = await knex('bookmarked').select('id').where(obj).first()
	if (data) return false;
	await knex('bookmarked').insert({
		...obj,
		create_at: knex.fn.now()
	})
	return await knex('bookmarked').select('id').where(obj).first()
}

model.delete = async function(req) {
	return await knex('bookmarked').where('id', req.params.bookmark_id).del()
}

module.exports = model;