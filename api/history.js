const express = require('express')
const history = express.Router()
const historyModel = require('../models/history')
const my = require("../tools/myModules");

history.get('/', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await historyModel.getList(req)
	res.json(data)
}))

history.post('/', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await historyModel.new(req)
	res.json(data)
}))

history.delete('/:history_id', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await historyModel.delete(req)
	res.json(data)
}))

module.exports = history