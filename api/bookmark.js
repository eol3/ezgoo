const express = require('express')
const bookmark = express.Router()
const bookmarkModel = require('../models/bookmark')
const my = require("../tools/myModules");

bookmark.get('/', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await bookmarkModel.getList(req)
	res.json(data)
}))

bookmark.post('/', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await bookmarkModel.new(req)
	res.json(data)
}))

bookmark.delete('/:bookmark_id', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await bookmarkModel.delete(req)
	res.json(data)
}))

module.exports = bookmark