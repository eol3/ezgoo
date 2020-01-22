const express = require('express')
const user = express.Router()
const userModel = require('../models/user')
const my = require("../tools/myModules");
var multer  = require('multer')
var root = require('../tools/root');

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

user.get('/test', my.test, function(req, res, next) {
  res.json(false)
})

user.get('/', my.wrapAsync(async function(req, res, next) {
  if (req.session.user) {
    res.json(req.session.user)
  } else {
    res.json(false)
  }
}))

user.get('/store', my.authLogin, my.wrapAsync(async function(req, res) {
  let data = await userModel.getStore(req)
  res.json(data)
}))

user.get('/:user_id', my.wrapAsync(async function(req, res, next) {
  let data = {}
  if (req.session.user && req.session.user.id === parseInt(req.params.user_id)) {
    data = await userModel.getFullOne(req)
  } else {
    data = await userModel.getOne(req)
  }
	res.json(data)
}))

user.put('/role', my.checkStoreId, my.authLogin, my.wrapAsync(async function(req, res) {
  await userModel.setRole(req)
  let role = await userModel.getRelateRole(req.session.user.id, req)
  req.session.user.role = role
  res.json(role)
}))

user.put('/:user_id', my.authLogin, my.wrapAsync(async function(req, res) {
  await userModel.checkUnique(req)
  let data = await userModel.save(req)
  req.session.user.nickname = data.nickname
  req.session.user.account = data.account
  res.json(data)
}))

user.put('/:user_id/cart', my.authLogin, my.wrapAsync(async function(req, res) {
  let data = await userModel.setCart(req)
  res.json(data)
}))

user.put('/:user_id/avatar', my.authLogin, avatarUpload, my.wrapAsync(async function(req, res) {
  let data = await userModel.saveAvatar(req)
  if (!data) {
    req.session.user.avatar_url = ""
  } else {
    req.session.user.avatar_url = data.avatar_url
  }
  res.json(data)
}))

user.post('/login', my.wrapAsync(async function(req, res, next) {
  let data = await userModel.check(req)
  if(data){
    req.session.user = data
    if (req.query.store_account !== undefined) {
      let role = await userModel.getRelateRole(data.id, req)
      req.session.user.role = role
    }
    result = { 
      'msg': '登入成功',
      'user': data,
      'cart': await userModel.getCart(data.id)
    }
  }else{
    res.status(401)
    result = { 'msg': '登入失敗'}
  }
  res.json(result)
}));

user.post('/register', my.wrapAsync(async function(req, res, next) {
  await userModel.checkUnique(req)
  var result = {}
  
  data = await userModel.regist(req)
  if(data){
    req.session.user = data
    result = { 
      'msg': '註冊成功',
      'user': data
    }
  }else{
    res.status(400)
    result = { 'msg': '註冊失敗'}
  }
  res.json(result)
}))

user.post('/logout', my.wrapAsync(async function(req, res, next) {
  let data = await req.session.destroy()
  if(data){
    result = { 'msg': '登出成功'}
  }else{
    res.status(400)
    result = { 'msg': '登出失敗'}
  }
  res.json(result)
}))

module.exports = user
