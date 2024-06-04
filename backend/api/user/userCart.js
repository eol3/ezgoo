const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const userCart = require(process.cwd() + '/models/user/userCart')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

router.get('/', auth, async function(req, res, next) {
  
  const useData = {
    userId: req.session.user.id,
	}
  
  let result = await userCart.getOne(useData)
  if (!result) res.json([])
  else res.json(JSON.parse(result.content))
})

router.post('/', auth, async function(req, res, next) {
  const useData = {
    userId: req.session.user.id,
    content: req.body.content,
    createBy: req.session.user.id,
		updateBy: req.session.user.id,
	}
	
  const validator = wrapValidator(useData, {
    content: 'required|string'
  })
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  let result = await userCart.getOne(useData)

  if (result) {
    delete useData.createBy
    await userCart.update(
      { userId: useData.userId },
      { content: useData.content }
    )
  } else {
    await userCart.create(useData)
  }
  
  res.json()
})