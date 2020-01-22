const express = require('express')
const post = express.Router()
const postModel = require('../models/post')
const storeModel = require('../models/store')
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


post.get('/', my.checkStoreId, my.wrapAsync(async function(req, res, next) {
	//my.checkParams(req, ["store_id"])
	let data = await postModel.getList(req)
	res.json(data)
}))

// 後台管理使用的api

post.get('/manage', my.authStoreRole, my.wrapAsync(async function(req, res, next) {
	let data = await postModel.getManageList(req)
	res.json(data)
}))

post.get('/:post_id', my.wrapAsync(async function(req, res, next) {
	let data = await postModel.getOne(req)
	res.json(data)
}))

post.get('/:post_id/manage', my.authStoreRole, my.wrapAsync(async function(req, res) {
	let data = await postModel.getManageOne(req)
	res.json(data)
}))

post.post('/', my.authStoreRole, upload, my.wrapAsync(async function(req, res) {
	let data = await postModel.new(req)
  res.json({ 'msg': 'success' })
}))

post.put('/:post_id', my.authStoreRole, upload, my.wrapAsync(async function(req, res) {
	let data = await postModel.save(req)
	res.json({ 'msg': 'success' })
}))

post.put('/:post_id/status', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await postModel.setStatus(req)
	res.json({ 'msg': 'success' })
}))

post.put('/:post_id/top', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await postModel.setStatus(req)
	res.json({ 'msg': 'success' })
}))

post.put('/:post_id/delete', my.authStoreRole, my.wrapAsync(async function(req, res){
  let data = await postModel.delete(req)
	res.json({ 'msg': 'success' })
}))

module.exports = post