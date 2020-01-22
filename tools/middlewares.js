

var check2 = function(next) {
  const err = new Error('ddd')
  err.statusCode = 400
  err.msg = "dddd"
  throw err
  // return next({
  //   'statusCode': 400,
  //   'msg': '缺少參數:eeeee'
  // })
}

var checkParams = function(req, check_query_arr, check_body_arr) {
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

var checkStoreId = function(req, res, next) {
  if (req.query.store_id === undefined) {
    return next({
      'statusCode': 400,
      'msg': '缺少參數:store_id'
    })
  }
  next()
}

var checkClassId = function(req, res, next) {
  if (req.query.class_id === undefined) {
    return next({
      'statusCode': 400,
      'msg': '缺少參數:class_id'
    })
  }
  next()
}

var checkId = function(req, res, next) {
  if (req.body.id === undefined) {
    return next({
      'statusCode': 400,
      'msg': '缺少參數:id'
    })
  }
  next()
}

var auth = function(req, res, next) {
  if (req.session.user === undefined) {
    return next({
      'statusCode': 403,
      'msg': '無權訪問'
    })
  }
  let check = false
  let store_id = 0
  if(req.params.store_id !== undefined){
    store_id = Number(req.params.store_id)
  }else{
    store_id = Number(req.query.store_id)
  }
  for (let i in req.session.user.relate_store) {
    if (req.session.user.relate_store[i].store_id === store_id) {
      check = true
    }
  }
  if (!check) {
    return next({
      'statusCode': 403,
      'msg': '無權訪問'
    })
  }
  next();
}

module.exports = {
  'check2': check2,
  'checkParams': checkParams,
  'checkStoreId': checkStoreId,
  'checkClassId': checkClassId,
  'checkId': checkId,
  'auth': auth
};