const knex = require('../config/database')
var model = {}

model.getList = async function (req) {
	let data = await knex('class').where({'store_id': req.query.store_id, 'status': 1}).orderBy('priority')
	return data
}

model.getManageList = async function (req) {
	let data = await knex('class').where({'store_id': req.query.store_id})
											.where('status', '>=' , 0)
											.orderBy('priority')
	return data
}

model.new = async function(req, res) {
	let result = await knex('class').insert({
		store_id: req.query.store_id,
		parent_id: req.body.parent_id,
		name: req.body.name,
		create_by: req.session.user.id,
		create_at: knex.fn.now(),
		update_by: req.session.user.id,
		update_at: knex.fn.now(),
	})
	let new_class_id = result[0]
	result = await knex('class').where({'store_id': req.query.store_id}).max('priority', {as: 'max_priority'})
	let max_priority = result[0].max_priority + 1
	await knex('class').where('id', '=', new_class_id).update({ priority: max_priority })
	let all_class = await knex('class').where({'store_id': req.query.store_id}).where('status', '>=' , 0)
	this.setChildren(all_class, req.body.parent_id)
	return await knex('class').where({ id: new_class_id }).first()
}

model.save = async function(req, res) {

	if (req.body.name) {
		await knex('class').where('id', '=', req.params.class_id).update({
			name: req.body.name,
			update_by: req.session.user.id,
			update_at: knex.fn.now(),
		})
	}
	if (req.body.parent_id !== undefined) {
		let ori_class = await knex('class').where('id', '=', req.params.class_id).first()
		await knex('class').where('id', '=', req.params.class_id).update({
			parent_id: req.body.parent_id,
			update_by: req.session.user.id,
			update_at: knex.fn.now(),
		})
		let all_class = await knex('class').where({'store_id': req.query.store_id}).where('status', '>=' , 0)
		
		this.setChildren(all_class, req.body.parent_id)
		this.setChildren(all_class, ori_class.parent_id)
	}
	
	return true
}

model.setStatus = async function (req) {
	let status = 0
	if(req.body.status){
		status = 1
	}
	await knex('class').where('id', '=', req.params.class_id).update({ status: status })
	return true
}

model.changePriority = async function (req) {
	for(let i in req.body.classes){
		await knex('class').where('id', '=', req.body.classes[i].id).update({ priority: req.body.classes[i].priority })
	}
	return true
}

model.delete = async function (req) {
	await knex('class').where('id', '=', req.params.class_id).update({ status: -1 })
	let class_obj = await knex('class').where({ 'id': req.params.class_id }).first()
	let all_class = await knex('class').where({'store_id': req.query.store_id}).where('status', '>=' , 0)
	this.setChildren(all_class, class_obj.parent_id)
	return true
}

model.setChildren = async function(all_class, class_id) {
	if(class_id === undefined || class_id === null)return true
	let class_obj = await knex('class').where({ 'id': class_id }).first()
	this.setChildren(all_class, class_obj.parent_id)
	let stack = [class_id]
	let children = []
	while(stack.length !== 0){
		for(let i in all_class){
			if(all_class[i].parent_id === stack[0]){
				stack.push(all_class[i].id)
				children.push(all_class[i].id)
			}
		}
		stack.shift()
	}
	let str = children.join('-')
	if(str === "") str = null
	await knex('class').where({ 'id': class_id }).update({ children: str })
	return true
}

module.exports = model;