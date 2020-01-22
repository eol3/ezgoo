const express = require('express')
const prom = express.Router()
const promModel = require('../models/promotions')
const my = require("../tools/myModules");

prom.get('/', my.checkStoreId, my.wrapAsync(async function(req, res, next) {
	let data = await promModel.getList(req)
	res.json(data)
}))

prom.get('/manage', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await promModel.getManageList(req)
	res.json(data)
}))

prom.get('/:prom_id/manage', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await promModel.getManageOne(req)
	res.json(data)
}))

prom.post('/', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await promModel.new(req)
	res.json(data)
}))

prom.put('/:prom_id/', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await promModel.save(req)
	res.json(data)
}))

prom.put('/:prom_id/status', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await promModel.setStatus(req)
	res.json({ 'msg': 'success' })
}))

prom.delete('/:prom_id', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await promModel.delete(req)
	res.json(data)
}))


module.exports = prom