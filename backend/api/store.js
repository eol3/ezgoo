const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Store = require(process.cwd() + '/models/store')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

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
	// console.log(useData)
	let result = await Store.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
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
  if (!useData.account) {
    await Store.update({ id: result[0] }, { account: result[0] })
  }
  result = await Store.getOne({ id: result[0] })
  
  res.status(200).json({
    msg: '新增成功',
    store: result
  });
})