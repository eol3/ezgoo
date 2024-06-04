const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Order = require(process.cwd() + '/models/order/order')
const OrderLog = require(process.cwd() + '/models/order/orderLog')
const auth = require(process.cwd() + "/tools/middlewares.js").auth
const { authStore }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/count', async function(req, res, next) {
	
	const useData = {
    userId: req.session.user.id,
		storeId: req.query.storeId,
		status: req.query.status,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
  }, 'order')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
	
	let result = await OrderLog.getCount(useData)
	
	res.json(result)
})

router.get('/', auth, async function(req, res, next) {

	const useData = {
		orderId: req.query.orderId,
    storeId: req.query.storeId,
  }
  
  const validator = wrapValidator(useData, {
    orderId: 'required|numeric|min:1',
    storeId: 'numeric|min:1',
    status: 'required|enum:status',
    comment: 'string'
  }, 'order');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }

	let result = await Order.getOne({ id: useData.id })

	if (useData.storeId) {
    if (!await authStore(req, next, {
      storeId: useData.storeId,
      role: ['owner', 'editor']
    })) return
		delete useData.storeId
  } else {
    // 由消費者提出請求，驗證user id
    if (Number(result.createBy) !== req.session.user.id) {
      next({statusCode: 403})
      return
    }
  }

  res.json(result)
})