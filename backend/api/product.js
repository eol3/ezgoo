const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Product = require(process.cwd() + '/models/product')

module.exports = router

router.get('/:productId', async function(req, res, next) {
	
	const useData = {
		id: req.params.productId
	}
	
	const validator = wrapValidator(useData, {
	  id: 'required|numeric|min:0',
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 404 })
  }
	console.log(useData)
	let result = await Product.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
})

router.get('/', async function(req, res, next) {
	
	const useData = {
		storeId: req.query.storeId,
		status: req.query.status,
		withImages: req.query.withImages || false,
		sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
		limit: req.query.limit || 10,
		offset: req.query.offset || 0
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'string',
		status: 'string',
	  withImages: 'boolean',
	  withLabels: 'boolean',
	  sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
	  limit: 'numeric|min:0',
	  offset: 'numeric|min:0'
  }, 'product')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  if (useData.status != 1) {
  	const authUserStoreRole = require(process.cwd() + '/tools/libs').authUserStoreRole
	  if (!await authUserStoreRole(req, useData.storeId, ['owner', 'editor'])) {
	  	return next({statusCode: 403 })
	  }
  }
	
	let result = await Product.getList(useData)
	
	res.json(result)
})

router.post('/', async function(req, res, next) {
	
	const useData = {
    storeId: req.query.storeId,
    name: req.body.name,
    price: req.body.price, // -1:未標示售價, -2:僅展示
    number: req.body.price,
    describe: req.body.describe,
    status: req.body.status, // 0:未公開, 1:已公開
  }
  
  const validator = wrapValidator(useData, {
    storeId: 'required|string',
    name: 'required|string',
    price: 'required|numeric',
    number: 'numeric',
    describe: 'string',
    status: 'required|numeric',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  const authUserStoreRole = require(process.cwd() + '/tools/libs').authUserStoreRole
  if (!await authUserStoreRole(req, useData.storeId, ['owner', 'editor'])) {
  	return next({statusCode: 403 })
  }
  
  // result = await Product.create(useData)
  
  res.status(200).json({
    msg: '新增成功',
  });
})