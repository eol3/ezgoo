const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const userStore = require(process.cwd() + '/models/user/userStore')
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
  
  let result = await userStore.getList({ userId: req.session.user.id })
  
  if (useData.withStore) {
    const Store = require(process.cwd() + '/models/store/store')
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
    res.json()
	  return
	}
	
  if (useData.withStore) {
    const Store = require(process.cwd() + '/models/store/store')
    const storeDetail = await Store.getOne({ accout: useData.storeId })
    result.store = storeDetail
  }
	
	if (!result) {
	  res.json()
	} else {
	  res.json(result)
	}
})