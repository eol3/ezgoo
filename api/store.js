const express = require('express')
const store = express.Router()
const storeModel = require('../models/store')
const m = require("../tools/middlewares");
const my = require("../tools/myModules");
var multer  = require('multer')
var root = require('../tools/root');

var storage =   multer.diskStorage({
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

var avatarStorage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, root + '/public/avatars/');
  },
  filename: function (req, file, callback) {
    let fileExtension = '';
    if(file.mimetype === 'image/jpeg'){
      fileExtension = 'jpg';
    }
    callback(null, Date.now() + "." + fileExtension);
  }
});
var avatarUpload = multer({ storage : avatarStorage }).single('avatar');

store.get('/:id', my.wrapAsync(async function(req, res) {
	let data = await storeModel.getOne(req)
	if (req.session.user) {
	  data.role = await storeModel.getRole(data.id, req)
	}
	res.json(data)
}))

store.get('/:id/manage', my.wrapAsync(async function(req, res) {
	let data = await storeModel.getManageOne(req)
	res.json(data)
}))

store.get('/:store_id/user', my.authStoreRole, my.wrapAsync(async function(req, res) {
  let data = await storeModel.getUser(req)
  res.json(data)
}))

store.put('/:store_id', my.authStoreRole, upload, my.wrapAsync(async function(req, res) {
  let data = await storeModel.save(req)
	res.json(data)
}))

store.put('/:store_id/user', my.authStoreRole, my.wrapAsync(async function(req, res) {
  let data = await storeModel.addUser(req)
  res.json(data)
}))

store.put('/:store_id/avatar', my.authStoreRole, avatarUpload, my.wrapAsync(async function(req, res) {
	let data = await storeModel.saveAvatar(req)
	res.json(data)
}))

store.delete('/:store_id/user', my.authStoreRole, my.wrapAsync(async function(req, res) {
  let data = await storeModel.delUser(req)
  res.json(data)
}))

module.exports = store