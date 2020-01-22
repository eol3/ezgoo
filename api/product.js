const express = require('express')
const product = express.Router()
const productModel = require('../models/product')
var multer  = require('multer')
var root = require('../tools/root');
const my = require("../tools/myModules");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, root + '/public/images/');
  },
  filename: function (req, file, callback) {
    let fileExtension = '';
    if(file.mimetype === 'image/jpeg'){
      fileExtension = 'jpg';
    }
    callback(null, Date.now() + "." + fileExtension);
  }
});
var upload = multer({ storage : storage }).array('images',10);

product.get('/', my.checkStoreId, my.wrapAsync(async function(req, res, next) {
	let data = await productModel.getList(req)
	res.json(data)
}))

// 後台管理使用的api

product.get('/manage', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await productModel.getManageList(req)
	res.json(data)
}))

product.get('/:product_id', my.wrapAsync(async function(req, res, next) {
	let data = await productModel.getOne(req)
	if(req.session.user !== undefined) {
		const historyModel = require('../models/history')
		historyModel.new(req)
	}
	res.json(data)
}))

product.get('/:product_id/manage', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await productModel.getManageOne(req)
	res.json(data)
}))

product.post('/', my.authStoreRole, upload, my.wrapAsync(async function(req, res) {
	let data = await productModel.new(req)
  res.json({ 'msg': 'success' })
}))

product.put('/priority', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await productModel.changePriority(req)
	res.json({ 'msg': 'success' })
}))

product.put('/:product_id', my.authStoreRole, upload, my.wrapAsync(async function(req, res) {
	let data = await productModel.save(req)
	res.json({ 'msg': 'success' })
}))

product.put('/:product_id/status', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await productModel.setStatus(req)
	res.json({ 'msg': 'success' })
}))

product.put('/:product_id/delete', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await productModel.delete(req)
	res.json({ 'msg': 'success' })
}))

product.post('/class/', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await productModel.newClass(req)
  res.json({ 'msg': 'success' })
}))


module.exports = product