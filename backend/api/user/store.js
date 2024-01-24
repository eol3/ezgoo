const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Store = require(process.cwd() + '/models/store')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

router.get('/', auth, async function(req, res, next) {
  
  let result = await Store.getList({ createBy: req.session.user.id })
  res.json(result)
})

router.get('/:storeId', auth, async function(req, res, next) {
  
  const useData = {
		account: req.params.storeId
	}
	
  const validator = wrapValidator(useData, {
	  account: 'required|string',
  }, 'store')
  
  if (validator.fail) {
  	return next({statusCode: 404 })
  }
	
  let result = await Store.getOne({ 
    account: useData.account,
    createBy: req.session.user.id
  })
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
})