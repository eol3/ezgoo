
var m = {}

m.wrapAsync = function(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

m.checkParams = function(req, check_query_arr, check_body_arr) {
  let check_error = false
  let check_error_obj = [];
  if (check_query_arr !== undefined) {
    for(let i in check_query_arr){
      if(!req.query.hasOwnProperty(check_query_arr[i])){
        check_error_obj.push(check_query_arr[i])
      }
    }
  }
  if (check_body_arr !== undefined) {
    for(let i in check_query_arr){
      if(!req.body.hasOwnProperty(check_query_arr[i])){
        check_error_obj.push(check_query_arr[i])
      }
    }
  }
  if (check_error_obj.length > 0) {
    const err = new Error('Miss some field!')
    err.statusCode = 400
    err.msg = "缺少參數:" + check_error_obj.join(",")
    throw err
  }
}

m.checkStoreId = async function(req, res, next) {
  if (req.query.store_id === undefined && req.query.store_account === undefined) {
    return next({
      'statusCode': 400,
      'msg': '缺少storeId相關參數'
    })
  }
  if (req.query.store_account !== undefined) {
    const knex = require('../config/database')
    let store = await knex('store').where({'account': req.query.store_account}).first()
    if (store) {
		  req.query.store_id = store.id
    } else {
      return next({
        'statusCode': 400,
        'msg': '找不到商店'
      })
    }
  }
  next()
}

m.authLogin = function(req, res, next) {
	if (req.session.user === undefined) {
		return next({
			statusCode: 403,
    	msg: "必須登入"
		})
	}
	next()
}

m.authStoreRole = async function(req, res, next) {
	if (req.query.store_id === undefined && req.params.store_id === undefined) {
    return next({
      'statusCode': 400,
      'msg': '缺少參數:store_id'
    })
  }
  
	if (req.session.user === undefined) {
		return next({
			statusCode: 403,
    	msg: "必須登入"
		})
	}
  let check = false
  let permission_check = false
  let store_id = 0
  if(req.params.store_id !== undefined){
    store_id = Number(req.params.store_id)
  }else{
    store_id = Number(req.query.store_id)
  }
  // let role = ""
  // for (let i in req.session.user.relate_store) {
  //   if (req.session.user.relate_store[i].store_id === store_id) {
  //     check = true
  //     role = req.session.user.relate_store[i].role
  //   }
  // }
  if (req.session.user.role.store_id !== store_id) {
    return next({
			statusCode: 403,
    	msg: "無權存取此商店資料"
		})
  }
  permission_check = await m.checkRolePermission(req.session.user.role.manage, store_id, req, next);
  if (!permission_check) {
    return next({
			statusCode: 403,
    	msg: "無權存取"
		})
  }
  next()
}

m.checkRolePermission = async function(role, store_id, req, next){
  let query_obj = {}
  query_obj.role = role
  query_obj.store_id = store_id
  let path = req.baseUrl
  if (path.charAt(path.length - 1) === '/') {
    path = path.substr(0, path.length - 1)
  }
  query_obj.resource = path.replace('/api/', '')
  if (req.method === "GET") {
    query_obj.read = 1
  } else if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    query_obj.write = 1
  }
  //const knex = require('../config/database')
  //let data = await knex('permissions').where(query_obj).first()
  let check = false
  let permissions = require('../config/permissions')
  let data = {};
	for (let i in permissions) {
		if ( query_obj.resource === permissions[i].resource ) {
      for (let j in permissions[i].permisions) {
        if (permissions[i].permisions[j].role === query_obj.role) {
          if (query_obj.read) {
            if (permissions[i].permisions[j].read) check = true
          } else if (query_obj.write) {
            if (permissions[i].permisions[j].read) check = true
          }
        }
      }
    }
	}

  return check
}

m.test = function(req, res, next){
  console.log(req.route)
  next()
}

module.exports = m;