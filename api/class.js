const express = require('express')
const classify = express.Router()
const classModel = require('../models/class')
const my = require("../tools/myModules");

classify.get('/', my.checkStoreId, async function(req, res) {
	let data = await classModel.getList(req)
	res.json(data)
})

classify.get('/manage', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await classModel.getManageList(req)
	res.json(data)
}))

classify.post('/', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await classModel.new(req)
	res.json({
  	'data': data,
  	'msg': 'success'
  })
}))

classify.put('/priority', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await classModel.changePriority(req)
  res.json({ 'msg': 'success' })
}))

classify.put('/:class_id', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await classModel.save(req)
  res.json({ 'msg': 'success' })
}))

classify.put('/:class_id/status', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await classModel.setStatus(req)
	res.json({ 'msg': 'success' })
}))

classify.put('/:class_id/delete', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await classModel.delete(req)
	res.json({ 'msg': 'success' })
}))

module.exports = classify