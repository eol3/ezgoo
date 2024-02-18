const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Store = require(process.cwd() + '/models/store')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

router.get('/:storeId/dashboard', async function(req, res, next) {
  
  const useData = {
		account: req.params.storeId
	}
	
  const authUserStoreRoleGroup = require(process.cwd() + '/tools/libs').authUserStoreRoleGroup
  if (!await authUserStoreRoleGroup(req, useData.account, 'manage')) {
  	return next({statusCode: 403 })
  }
  
  let result = await Store.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
})

router.get('/:storeId', async function(req, res, next) {
	
	const useData = {
		account: req.params.storeId
	}
	
	const validator = wrapValidator(useData, {
	  account: 'required|string',
  }, 'store')
  
  if (validator.fail) {
  	return next({statusCode: 404 })
  }
	
	let result = await Store.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
})

router.get('/', async function(req, res, next) {
  
  const useData = {
		createBy: req.query.createBy
	}
	
	if (useData.createBy) {
	  if (req.session.user.id !== useData.userId) {
	    res.status(403).json({msg: 'Forbidden'})
	  }
	}
  
  let result = await Store.getList(useData)
  res.json(result)
})

router.post('/', auth, async function(req, res, next) {
	const useData = {
    name: req.body.name,
    createBy: req.session.user.id,
    updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    account: 'string|max:64',
    name: 'required|string|max:64',
  }, 'store');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  result = await Store.create(useData)
  let newStoreId = result[0]
  if (!useData.account) {
    await Store.update({ id: newStoreId }, { account: newStoreId })
  }
  result = await Store.getOne({ id: newStoreId })
  
  const userStore = require(process.cwd() + '/models/userStore')
  await userStore.create({
    userId: useData.createBy,
    storeId: newStoreId,
    roleGroup: 'manage',
    role: 'owner',
    createBy: useData.createBy,
    updateBy: useData.createBy,
  })
  
  res.status(200).json({
    msg: '新增成功',
    store: result
  });
})