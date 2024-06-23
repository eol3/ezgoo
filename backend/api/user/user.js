const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const User = require(process.cwd() + '/models/user/user')
const Password = require(process.cwd() + '/tools/password')
const auth = require(process.cwd() + "/tools/middlewares.js").auth
const Mailer = require(process.cwd() + "/tools/mail.js")

module.exports = router

router.get('/', auth, async function(req, res, next) {
  res.json(req.session.user)
})

router.get('/logout', async function(req, res, next) {
  let data = await req.session.destroy()
  if(data){
    result = { 'msg': '登出成功'}
  }else{
    res.status(400)
    result = { 'msg': '登出失敗'}
  }
  res.json(result)
})

router.get('/profile', auth, async function(req, res, next) {
	
	const useData = {
		id: req.session.user.id
	}
	
	let result = await User.getOne(useData)
	delete result.password
// 	console.log(result)
	if (!result) {
	  return next({statusCode: 404, msg: '查無此使用者' })
	} else {
	  res.json(result)
	}
})

router.post('/logout', async function(req, res, next) {
  let data = await req.session.destroy()
  if(data){
    result = { 'msg': '登出成功'}
  }else{
    res.status(400)
    result = { 'msg': '登出失敗'}
  }
  res.json(result)
})

router.post('/login', async function(req, res, next) {
	const useData = {
    email: req.body.email,
    password: req.body.password,
  }
  
  const validator = wrapValidator(useData, {
    email: 'required|string|email|max:64',
    password: 'required|min:6|max:32',
  }, 'user');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  let result = await User.getOne({ email: useData.email })
  if (!result) {
    next({
      statusCode: 400,
      errors: {
        email: ['查無此E-mail']
      }
    });
    return;
  }
  
  let passValid = await Password.validate(result.password, useData.password)
  if (!passValid) {
    next({
      statusCode: 400,
      errors: {
        password: ['密碼錯誤']
      }
    });
    return;
  }
  
  delete result.password
  
  req.session.user = result
  res.status(200).json({
    msg: '登入成功',
    user: result
  })
})

router.post('/send-email-code', async function(req, res, next) {
  const useData = {
    email: req.body.email,
  }
  
  const validator = wrapValidator(useData, {
    email: 'required|string|email|max:64',
  }, 'user');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (req.body.register) {
    result = await User.getOne({ email: useData.email })
    if (result) {
      next({
        statusCode: 400,
        errors: { email: ['信箱已被註冊'] }
      });
      return;
    }
  }
  
  if (!await User.checkEmailCodeCount({ email: useData.email })) {
    next({statusCode: 422, msg: '30秒內僅能發送一次認證碼'}); return;
  }
  
  const ip = require(process.cwd() + '/tools/libs').getIp(req)
  let code = await User.generatekEmailCode({
    userId: 0,
    email: useData.email,
    ip: ip,
  })
  
  let html = "請輸入以下認證碼，進行E-mail認證，認證碼將在20分鐘之後失效。<br /><br/>" + code + "<br/><br/>"
  Mailer.send(useData.email, '系統發送驗證碼通知', html).catch(console.error)
  
  res.json()
  
})

router.post('/register', async function(req, res, next) {
	
	const useData = {
    email: req.body.email,
    verifyCode: req.body.verifyCode,
    password: req.body.password,
  }
  
  const validator = wrapValidator(useData, {
    email: 'required|string|email|max:64',
    verifyCode: 'required|numeric|digits:6',
    password: 'required|min:6|max:32',
  }, 'user');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  let result = await User.getOne({ email: useData.email })
  if (result) {
    next({
      statusCode: 400,
      errors: { email: ['E-mail已被註冊'] }
    });
    return;
  }
  
  // check verify code
  result = await User.checkEmailCode({
    email: useData.email,
    code: useData.verifyCode,
  })
  if (!result) {
    const ip = require(process.cwd() + '/tools/libs').getIp(req)
    User.addEmailErrorLog({
      code: useData.verifyCode,
      ip: ip,
      text: 'email:' + useData.email + ', action: register',
    })
    next({
      statusCode: 400,
      errors: { verifyCode: ['認證碼錯誤，或已過期'] }
    });
    return;
  } else {
    User.verifyEmailCode({ id: result.id })
  }
  delete useData.verifyCode
  
  useData.password = await Password.hash(useData.password)
  result = await User.create(useData)
  result = await User.getOne({ id: result[0] })
  req.session.user = result
  
  // 預設新增userCart
  const userCart = require(process.cwd() + '/models/user/userCart')
  userCart.create({
    userId: result.id,
    content: JSON.stringify([]),
    isRead: 1,
    createBy: result.id,
		updateBy: result.id,
  })

  res.status(200).json({
    msg: '註冊成功',
    user: {
      id: req.session.user.id
    }
  });
})

router.put('/profile', auth, async function(req, res, next) {
  
  const useData = {
		id: req.session.user.id,
		name: req.body.name,
		password: req.body.password,
	}
	
	const validator = wrapValidator(useData, {
	  name: 'string|max:32',
    password: 'min:6|max:128',
  }, 'user')
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
	
	if (useData.name === '') {
    delete useData.name
  }
  
  if (useData.password === '') {
    delete useData.password
  }
	
	if (useData.password) {
    useData.password = await Password.hash(useData.password)
  }
  
  let result = await User.update({ id: useData.id }, useData)
  
  res.json({msg: '修改成功'})
	
})