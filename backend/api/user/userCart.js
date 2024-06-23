const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const userCart = require(process.cwd() + '/models/user/userCart')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

router.get('/', auth, async function(req, res, next) {

  let result = await userCart.getOne({
    userId: req.session.user.id,
	})

  if (!result) return next({statusCode: 404})
  else {
    result.content = JSON.parse(result.content)
    res.json(result)
  }
})

// 註冊時新增
// router.post('/', auth, async function(req, res, next) {
  // const useData = {
  //   userId: req.session.user.id,
  //   content: req.body.content,
  //   createBy: req.session.user.id,
	// 	updateBy: req.session.user.id,
	// }
	
  // const validator = wrapValidator(useData, {
  //   content: 'required|string'
  // })
  
  // if (validator.fail) {
  // 	return next({statusCode: 400, ...validator.errors})
  // }

  // let result = await userCart.getOne(useData)

  // if (result) {
  //   delete useData.createBy
  //   await userCart.update(
  //     { userId: useData.userId },
  //     { content: useData.content }
  //   )
  // } else {
  //   useData.isRead = false
  //   await userCart.create(useData)
  // }
  
  // res.json()
// })

router.put('/', auth, async function(req, res, next) {
  const useData = {
    userId: req.session.user.id,
    content: req.body.content,
    isRead: req.body.isRead,
	}

  const validator = wrapValidator(useData, {
    isRead: 'boolean'
  })
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  await userCart.update(
    { userId: useData.userId },
    {
      content: JSON.stringify(useData.content),
      isRead: useData.isRead
    }
  )
  
  res.json()
})