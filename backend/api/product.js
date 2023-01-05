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
  
  if (validator.fails()) {
  	return next({statusCode: 404, msg: '查無此內容' })
  }
	
	let result = await Product.getOne({ id: useData.id })
	
	if (!result) {
	  return next({statusCode: 404, msg: '查無此內容' })
	} else {
	  res.json(result)
	}
})