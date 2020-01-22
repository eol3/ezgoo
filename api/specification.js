const express = require('express')
const spec = express.Router()
const specModel = require('../models/specification')
const my = require("../tools/myModules");

spec.get('/', my.checkStoreId, my.wrapAsync(async function(req, res, next) {
	let data = await specModel.getList(req)
	res.json(data)
}))

spec.post('/', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await specModel.new(req)
	res.json(data)
}))

spec.put('/', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await specModel.save(req)
	res.json(data)
}))

spec.delete('/:spec_id', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await specModel.delete(req)
	res.json(data)
}))

module.exports = spec