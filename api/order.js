const express = require('express')
const order = express.Router()
const orderModel = require('../models/order')
const my = require("../tools/myModules");

order.get('/', my.authLogin, my.wrapAsync(async function(req, res) {
	let data = await orderModel.getList(req)
	res.json(data)
}))

order.get('/manage/', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = []
	if(req.query.break_by !== undefined) {
		data = await orderModel.getManageListByItem(req)
	} else {
		data = await orderModel.getManageList(req)
	}
	res.json(data)
}))

order.get('/:order_id', my.authLogin, my.wrapAsync(async function(req, res) {
	let data = await orderModel.getOne(req)
	res.json(data)
}))

order.get('/:order_id/manage', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await orderModel.getManageOne(req)
	res.json(data)
}))

order.post('/', my.checkStoreId, my.authLogin, my.wrapAsync(async function(req, res){
  let data = await orderModel.new(req)
  res.json({ 'msg': 'success' })
}))

order.put('/:order_id/status', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await orderModel.setStatus(req)
  res.json({ 'msg': 'success' })
}))

order.put('/:order_id/cancel', my.authLogin, my.wrapAsync(async function(req, res){
  let data = await orderModel.setCancel(req)
  res.json({ 'msg': 'success' })
}))

module.exports = order