const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let data = await knex('history').where({'user_id': req.session.user.id}).first()
	if (data === undefined) return
	let product_arr = data.product_id.split('-').map( Number );
	let query = knex('product').select('product.id as product_id', 'product.*', 'store.account as store_account')
								.leftJoin('store', 'product.store_id', 'store.id')
	let order_str = '(CASE product.id '
	for(let i in product_arr){
		query.orWhere('product.id', product_arr[i])
		order_str += 'WHEN ' + product_arr[i] + ' THEN ' + i + ' '
	}
	order_str += 'END)'
	query.orderByRaw(order_str)
	let result = {}
	result.data = await query
	return result
}

model.new = async function (req) {
	// if (req.params.product_id === undefined) return;
	let data = await knex('history').where({'user_id': req.session.user.id}).first()
	if (data !== undefined) {
		let obj = data.product_id.split('-')
		let checkDouble = false
    for (let i in obj) {
      if (obj[i] === req.params.product_id) {
        obj.splice(i, 1)
        obj.splice(0, 0, req.params.product_id)
        checkDouble = true
        break
      }
    }
    if (obj.length > 50) {
      obj.splice(50, 10)
    }
    if (!checkDouble) {
      obj.splice(0, 0, req.params.product_id)
    }
    let history = ''
    for (var key in obj) {
      history += obj[key] + '-'
    }
    history = history.substring(0, history.length - 1)
    await knex('history').where({'user_id': req.session.user.id}).update('product_id', history)
    return true
	} else {
		return await knex('history').insert({
			'user_id': req.session.user.id,
			'product_id': req.params.product_id,
			'update_at': knex.fn.now()
		})
	}
}

model.delete = async function(req) {
	return await knex('history').where('id', req.params.history_id).del()
}

module.exports = model;