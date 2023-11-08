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
  	return next({statusCode: 404, msg: '查無此內容' })
  }
	console.log(useData)
	let result = await Product.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404, msg: '查無此內容' })
	} else {
	  res.json(result)
	}
})

router.get('/', async function(req, res, next) {
	
	const useData = {
		withImages: req.query.withImages || false,
		sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
		limit: req.query.limit || 10,
		offset: req.query.offset || 0
	}
	
	const validator = wrapValidator(useData, {
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
	
	let result = await Product.getList(useData)
	
	res.json(result)
})