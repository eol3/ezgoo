const express = require('express')
const like = express.Router()
const likeModel = require('../models/like')
const my = require("../tools/myModules");

like.get('/', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await likeModel.getList(req)
	res.json(data)
}))

like.post('/', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await likeModel.new(req)
	res.json(data)
}))

like.delete('/:like_id', my.authLogin, my.wrapAsync(async function(req, res, next) {
	let data = await likeModel.delete(req)
	res.json(data)
}))

module.exports = like