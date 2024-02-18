const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const userStore = require(process.cwd() + '/models/userStore')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

router.get('/', auth, async function(req, res, next) {
  
  const useData = {
		withStore: req.query.withStore
	}
	
  const validator = wrapValidator(useData, {
	  withStore: 'boolean',
  })
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  let result = await userStore.getList({ createBy: req.session.user.id })
  
  if (useData.withStore) {
    const Store = require(process.cwd() + '/models/store')
    for(let item of result) {
      const storeDetail = await Store.getOne({ id: item.storeId })
      item.store = storeDetail
    }
  }
  
  res.json(result)
})

router.get('/:storeId', auth, async function(req, res, next) {
  
  const useData = {
		storeId: req.params.storeId,
		withStore: req.query.withStore
	}
	
  const validator = wrapValidator(useData, {
	  storeId: 'required|string',
	  withStore: 'boolean',
  })
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
	
  let result = await userStore.getOne({
    storeId: useData.storeId,
    userId: req.session.user.id
  })
  
  if (!result) {
	  return next({statusCode: 404 })
	}
	
  if (useData.withStore) {
    const Store = require(process.cwd() + '/models/store')
    const storeDetail = await Store.getOne({ accout: useData.storeId })
    result.store = storeDetail
  }
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
})