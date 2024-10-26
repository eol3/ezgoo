const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Order = require(process.cwd() + '/models/order/order')
const OrderLog = require(process.cwd() + '/models/order/orderLog')
const { authStore }= require(process.cwd() + '/tools/libs')
const auth = require(process.cwd() + "/tools/middlewares.js").auth
const Mailer = require(process.cwd() + "/tools/mail.js")

module.exports = router

/*
status: -1=取消,0=未成立,1=訂單成立,2=接受訂單,3=出貨,4=到貨,5=完成,6=退貨,7=收到退貨重新出貨,8=未取貨
payment: 1=匯款,2=到店付款,3=信用卡
paymentStatus: 0=待付款,1=已付款,2=已付款(由第三方api)
shippingMethod: 1=宅配,2=到店取貨,3=超商取貨,4=面交
*/

router.get('/count', auth, async function(req, res, next) {
	
	const useData = {
    userId: req.session.user.id,
		storeId: req.query.storeId,
		status: req.query.status,
    word: req.query.word,
    startAt: req.query.startAt,
    endAt: req.query.endAt,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
    word: 'string',
    startAt: 'date',
    endAt: 'date',
  }, 'order')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  if (useData.storeId) {
    if (!await authStore(req, next, {
      storeId: useData.storeId,
      status: useData.status,
      role: ['owner', 'editor']
    })) return
    // if (!await authUserStoreRoleGroup(req, next, useData.storeId, 'manage')) return
    delete useData.userId
  }

  if (useData.status === 'all') delete useData.status
	
	let result = await Order.getCount(useData)
	
	res.json(result)
})

router.get('/', auth, async function(req, res, next) {
	
	const useData = {
    userId: req.session.user.id,
		storeId: req.query.storeId,
		status: req.query.status,
    word: req.query.word,
		sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
		limit: req.query.limit || 10,
		offset: req.query.offset || 0,
    startAt: req.query.startAt,
    endAt: req.query.endAt,
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
    word: 'string',
	  sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
	  limit: 'numeric|min:0',
	  offset: 'numeric|min:0',
    startAt: 'date',
    endAt: 'date',
  }, 'order')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }
  
  if (useData.storeId) {
    if (!await authStore(req, next, {
      storeId: useData.storeId,
      status: useData.status,
      role: ['owner', 'editor']
    })) return
    // if (!await authUserStoreRoleGroup(req, next, useData.storeId, 'manage')) return
    delete useData.userId
  }
  
  if (useData.status === 'all') delete useData.status
	
	let result = await Order.getList(useData)

  for(const item of result) {
    if (item.thumbnail) {
      item.thumbnail = process.env.BASE_URL + item.thumbnail
    }
    item.storeInfo = JSON.parse(item.storeInfo)
    item.content = JSON.parse(item.content)
    item.recipientInfo = JSON.parse(item.recipientInfo)
    item.payerInfo = JSON.parse(item.payerInfo)
    item.footerInfo = JSON.parse(item.footerInfo)
  }
	
	res.json(result)
})

router.get('/:orderId', async function(req, res, next) {
	
	const useData = {
		id: req.params.orderId,
    storeId: req.query.storeId, // 帶這個參數表示由商家提出請求
	}
	
	const validator = wrapValidator(useData, {
	  id: 'required|numeric|min:1',
    storeId: 'numeric|min:1',
  }, 'order')
  
  if (validator.fail) {
  	return next({statusCode: 404 })
  }
	
	let result = await Order.getOne(useData)

  if (!result) {
	  return next({statusCode: 404 })
	}

  // 驗證身分
  if (useData.storeId) {
    if (!await authStore(req, next, {
      storeId: useData.storeId,
      role: ['owner', 'editor']
    })) return
  } else {
    if (result.userId === -1 && result.status === 0 && !req.session.user) {
      // 由商家開立訂單給消費者，或者消費者無登入下單
      // 僅限狀態0可讓訪客無狀態讀取
    } else {
      if (!req.session.user) {
        next({statusCode: 403})
        return
      }
      // 由消費者提出請求，驗證user id
      if (Number(result.userId) !== req.session.user.id) {
        next({statusCode: 403})
        return
      }
    }
  }

  // 取得log
  let logs = await OrderLog.getList({ orderId: useData.id })
  for (const item of logs) {
    item.from = JSON.parse(item.from)
    item.to = JSON.parse(item.to)
  }
  result.logs = logs

  result.storeInfo = JSON.parse(result.storeInfo)
  result.content = JSON.parse(result.content)
  result.recipientInfo = JSON.parse(result.recipientInfo)
  result.payerInfo = JSON.parse(result.payerInfo)
  result.footerInfo = JSON.parse(result.footerInfo)
	
	res.json(result)
})

router.post('/', async function(req, res, next) {
	
	const useData = {
    userId: req.session.user ? req.session.user.id : -1, // 無登入下訂單
    storeId: req.body.storeInfo ? req.body.storeInfo.id : null,
    status: req.body.status || 0, // 預設訂單狀態0:未成立
    storeInfo: req.body.storeInfo,
    content: req.body.content,
    memo: req.body.memo,
		createBy: req.session.user ? req.session.user.id : '-1',
		updateBy: req.session.user ? req.session.user.id : '-1',
  }
  
  const validator = wrapValidator(useData, {
    storeId: 'required|numeric|min:1',
    status: 'enum:status',
    storeInfo: 'required',
    content: 'required',
    memo: 'string',
  }, 'order');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }

  // check items
  // precheck()

  useData.storeInfo = JSON.stringify(useData.storeInfo)
  useData.content = JSON.stringify(useData.content)

  result = await Order.create(useData)
  res.status(200).json({ id: result[0] });
})

router.post('/checkout', async function(req, res, next) {
  const useData = {
    userId: req.session.user ? req.session.user.id : -1, // 無登入下訂單
    storeId: req.body.storeId,
    storeInfo: req.body.storeInfo,
    content: req.body.content,
    payment: req.body.payment,
    shippingMethod: req.body.shippingMethod,
    recipientInfo: req.body.recipientInfo,
    payerInfo: req.body.payerInfo,
    footerInfo: req.body.footerInfo,
		createBy: req.session.user ? req.session.user.id : '-1',
		updateBy: req.session.user ? req.session.user.id : '-1',
  }

  let ruleObj = {
    storeId: 'required|numeric|min:1',
    storeInfo: 'required|object',
    content: 'required|array',
    payment: 'required|enum:payment',
    shippingMethod: 'required|enum:shippingMethod',
    recipientInfo: 'required|object',
    payerInfo: 'required|object',
    'payerInfo.name': 'required|string',
    'payerInfo.tel': 'required|string',
    'payerInfo.email': 'required|email|string',
    'recipientInfo.name': 'required|string',
    'recipientInfo.tel': 'required|string',
    footerInfo: 'required|object',
  }

  if (useData.shippingMethod === 3) {
    ruleObj['recipientInfo.supermarketStoreName'] = 'required|string'
  } else if (useData.shippingMethod === 1) {
    ruleObj['recipientInfo.address'] = 'required|string'
  }

  validator = wrapValidator(useData, ruleObj, 'order')

  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }

  // 檢查商品資料
  if (!await checkContent(useData.content, res)) return

  const Store = require(process.cwd() + '/models/store/store')
  const storeInfo = await Store.getOne({ id: useData.storeId })

  if (!storeInfo) {
    next({statusCode: 422})
    return
  }

  if (storeInfo.status !== 1) {
    next({statusCode: 403})
    return
  }

  // 檢查商家允許未登入下單
  storeInfo.setting = JSON.parse(storeInfo.setting)
  if (!storeInfo.setting.allowOrderWithoutLogIn && !req.session.user) {
    res.status(403).json({msg: 'No login'})
    return
  }

  // 檢查付款方式與運送方式
  storeInfo.payment = JSON.parse(storeInfo.payment)
  if (!checkPayment(storeInfo.payment, useData.payment)) {
    next({statusCode: 403})
    return
  }
  storeInfo.shippingMethod = JSON.parse(storeInfo.shippingMethod)
  if (!checkShippingMethod(storeInfo.shippingMethod, useData.shippingMethod)) {
    next({statusCode: 403})
    return
  }

  // compute footer info
  let footerInfo = { subTotal: getSubTotal(useData.content) }
  let shippingFee = getShippingFee(storeInfo.shippingMethod, useData.shippingMethod)
  if (shippingFee) {
    footerInfo.shippingFee = shippingFee
  }
  let freeShipping = getFreeShipping(storeInfo.setting, footerInfo)
  if (freeShipping) {
    delete footerInfo.shippingFee
    footerInfo.freeShipping = true
  }
  let total = getTotal(footerInfo)
  if (total) {
    footerInfo.total = total
  }
  // 檢查訂單結算
  if (!await checkFooterInfo(footerInfo, useData.footerInfo, res)) return

  let mailOrderData = {
    storeId: useData.storeId,
    content: useData.content,
    footerInfo: useData.footerInfo,
    payerInfo: useData.payerInfo,
    isGuset: useData.createBy === '-1' ? true : false
  }

  useData.status = 1
  useData.storeInfo = JSON.stringify(useData.storeInfo)
  useData.content = JSON.stringify(useData.content)
  useData.recipientInfo = JSON.stringify(useData.recipientInfo)
  useData.payerInfo = JSON.stringify(useData.payerInfo)
  useData.footerInfo = JSON.stringify(useData.footerInfo)

  result = await Order.create(useData)
  res.status(200).json({ id: result[0] });

  useData.id = result[0]
  useData.comment = req.body.comment
  delete useData.storeId
  addOrderLog({ status: 0 }, useData)

  mailOrderData.id = result[0]
  // 發信給買家
  sendMailToCustomerOnFirst(mailOrderData)
  // 發信給商家
  sendMailToStoreOnFirst(mailOrderData)
})

router.put('/:orderId', async function(req, res, next) {
	
	const useData = {
    id: req.params.orderId,
    storeId: req.query.storeId,
    status: req.body.status,
    paymentStatus: req.body.paymentStatus,
    comment: req.body.comment,
		updateBy: req.session.user ? req.session.user.id : '-1',
  }

  let validator = wrapValidator(useData, {
    id: 'required|numeric|min:1',
    storeId: 'numeric|min:1',
    status: 'enum:status',
    payment: 'enum:payment',
    paymentStatus: 'enum:paymentStatus',
    shippingMethod: 'enum:shippingMethod',
    comment: 'string',
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

    result.payerInfo = JSON.parse(result.payerInfo)
    if (useData.comment) {
      sendMailToCustomerOnComment(result.payerInfo.email, result.id, useData.comment)
    }
    if (result.status === 1 && useData.status === 2) {
      sendMailToCustomerOnRecive(result.payerInfo.email, result.id)
    } else if (useData.status === 3) {
      sendMailToCustomerOnShipping(result.payerInfo.email, result.id)
    } else if (useData.status === 4) {
      sendMailToCustomerOnArrived(result.payerInfo.email, result.id)
    }
  } else {
    
    if (!req.session.user) return next({statusCode: 403})

    // 未登入訪客下單，不能讓消費者修改
    if (result.userId === -1) return next({statusCode: 403})

    // 由消費者提出請求，驗證user id
    if (Number(result.userId) !== req.session.user.id) {
      return next({statusCode: 403})
    }

    // 消費者提出請求變更訂單狀態
    if (useData.status) {
      if (result.status === -1) {
        // 已經取消的訂單不能再更改狀態
        return next({statusCode: 403})
      }
      if (result.status >= 2) {
        // 商家接單之後，不能取消訂單，也不能變更任何狀態
        return next({statusCode: 403})
      }
    }
    
    // 消費者不能變更付款狀態，由商家變更
    delete useData.paymentStatus

    // 如買家有留言發送給商家
    if (useData.comment) {
      sendMailToStoreOnComment(result.storeId, useData.id, useData.comment)
    }
  }
  
  addOrderLog(result, useData)
  
  await Order.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

router.delete('/:orderId', auth, async function(req, res, next) {
  const useData = {
		id: req.params.orderId,
    storeId: req.query.storeId,
  }

  const validator = wrapValidator(useData, {
		id: 'required|numeric|min:1',
    storeId: 'required|numeric|min:1',
  }, 'product');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
  
  if (!await authStore(req, next, {
    storeId: useData.storeId,
    role: ['owner', 'editor']
  })) return
  
  result = await Order.delete({ id: useData.id })
  
  res.status(200).json();

})

function addOrderLog(oriData, useData) {

  let from = {}
  let to = {}
  let change = false

  if (useData.status && oriData.status !== useData.status) {
    change = true
    from.status = oriData.status
    to.status = useData.status
  }

  // handle comment
  if (useData.comment && useData.comment !== '') {
    change = true
    to.comment = useData.comment
  }

  if (useData.storeId) {
    to.isStore = true
  }

  if (change) {
    OrderLog.create({
      orderId: useData.id,
      from: from,
      to: to,
      createBy: useData.updateBy
    })
  }

  delete useData.comment
}

function sendMailToCustomerOnFirst(order) {
  let html = "<h4>您的訂單已成立，以下訂單資訊</h4>"
  html += getOrderBody(order)
  if (order.isGuset) {
    html += "由於您未登入下單，如需聯絡商家請至此<a href='" + process.env.BASE_URL + "/store/" + order.storeId + "'>連結</a>查看"
  } else {
    html += "查看訂單詳情請至此<a href='" + process.env.BASE_URL + "/order/" + order.id + "'>連結</a>" 
  }
  Mailer.send(order.payerInfo.email, '訂單成立通知', html).catch(console.error)
}

async function sendMailToStoreOnFirst(order) {
  let userInfo = await getStoreOwner(order.storeId)
  let html = "<h4>已收到訂單成立，以下訂單資訊</h4>"
  html += getOrderBody(order)
  html += "查看與管理訂單請至此<a href='" + process.env.BASE_URL + "/manage/store/" + order.storeId + "/order/" + order.id + "/edit'>連結</a>"
  Mailer.send(userInfo.email, '收到訂單通知', html).catch(console.error)
}

function getOrderBody(order) {
  let html = "訂單編號:" + order.id + "<br/>"
            + "訂單狀態:已成立<br />訂單內容:<br />---<br />"
  for (let i in order.content) {
    let product = order.content[i]
    let optionStr = product.selectedOptions.filter(Boolean).join(',')
    optionStr = optionStr === '' ? '' : '(' + optionStr + ')'
    html += "<img src='" + product.thumbnail + "' width='30' />&nbsp;&nbsp;"
        + product.name + optionStr + "&nbsp;&nbsp;"
        + "x" + product.choiceNumber + "&nbsp;&nbsp;" + getPrice(product) + "<br />"
  }
  html += "---<br />"
  if (order.footerInfo.shippingFee) {
    html += "小計:" + order.footerInfo.subTotal + "<br />"
        + "運費:" + order.footerInfo.shippingFee + "<br />"
  }
  html += "總計:" + order.footerInfo.total + "<br /><br />"
  return html
}

async function getStoreOwner(storeId) {
  const userStore = require(process.cwd() + '/models/user/userStore')
  let storeOwner = await userStore.getOne({
    storeId: storeId,
    role: ['owner']
  })
  const User = require(process.cwd() + '/models/user/user')
  let userInfo = await User.getOne({ id: storeOwner.userId })
  return userInfo
}

async function sendMailToStoreOnComment(storeId, orderId, comment) {
  let userInfo = await getStoreOwner(storeId)
  let html = "<h4>買家訂單留言:</h4>"
            + "<p>" + comment + "</p>"
            + "如需回復請至此<a href='" + process.env.BASE_URL + "/manage/store/" + storeId + "/order/" + orderId + "/edit'>連結</a>"
  
  Mailer.send(userInfo.email, '訂單留言通知', html).catch(console.error)
}

async function sendMailToCustomerOnComment(userEmail, orderId, comment) {
  let html = "<h4>商家訂單留言:</h4>"
            + "<p>" + comment + "</p>"
            + "回復請至此<a href='" + process.env.BASE_URL + "/order/" + orderId + "'>連結</a>"
  Mailer.send(userEmail, '訂單留言通知', html).catch(console.error)
}

function sendMailToCustomerOnRecive(userEmail, orderId) {
  let html = "<h4>商家已接受訂單</h4>"
            + "查看訂單詳情請至此<a href='" + process.env.BASE_URL + "/order/" + orderId + "'>連結</a>"
  Mailer.send(userEmail, '商家已接受訂單通知', html).catch(console.error)
}

function sendMailToCustomerOnShipping(userEmail, orderId) {
  let html = "<h4>商家已出貨</h4>"
            + "查看訂單詳情請至此<a href='" + process.env.BASE_URL + "/order/" + orderId + "'>連結</a>"
  Mailer.send(userEmail, '商家已出貨通知', html).catch(console.error)
}

function sendMailToCustomerOnArrived(userEmail, orderId) {
  let html = "<h4>貨到通知</h4>"
            + "查看訂單詳情請至此<a href='" + process.env.BASE_URL + "/order/" + orderId + "'>連結</a>"
  Mailer.send(userEmail, '貨到通知', html).catch(console.error)
}

function checkPayment(storePayment, value) {
  for (item of storePayment) {
    if (item.id === value) {
      return item.enable
    }
  }
  return false
}

function checkShippingMethod(storeShippingMethod, value) {
  for (item of storeShippingMethod) {
    if (item.id === value) {
      return item.enable
    }
  }
  return false
}

function getPrice(product) {
  let price = 0
  if (product.variant && product.variant.price) price = product.variant.price
  else price = product.price
  return price * product.choiceNumber
}

function getSubTotal(list) {
  let total = 0
  for (const product of list) {
    total += getPrice(product)
  }
  return total
}

function getShippingFee(shippingMethod, id) {
  let total = 0
  for (const item of shippingMethod) {
    if (item.enable && item.id === id) {
      total = item.fee
    }
  }
  if (total === 0) return false
  else return total
}

function getFreeShipping(setting, footerInfo) {
  if (!footerInfo.shippingFee) return false
  if (setting.untilAmountFreeShipping) {
    if (footerInfo.subTotal > setting.untilAmountFreeShipping) return true
    else return false
  } else return false
}

function getTotal(footerInfo) {
  let total = 0
  for (const i in footerInfo) {
    total += footerInfo[i]
  }
  if (total === 0) return false
  else return total
}

/* order.content 範例:
[{
  "id": 161,
  "name": "w",
  "price": 26,
  "choiceNumber": 1,
  "variant": false,
  "selectedOptions": [
    null,
    null,
    null
  ],
  "thumbnail": "http://64.111.98.77:8080/uploads/product-images/665/default.jpg"
},
{
  "id": 162,
  "name": "buu",
  "price": 650,
  "choiceNumber": 1,
  "variant": {
    "id": 61,
    "price": 500
  },
  "selectedOptions": [
    "qq",
    null,
    null
  ],
  "thumbnail": "http://64.111.98.77:8080/uploads/product-images/655/default.jpg"
}] */

// 預檢查內容格式與資料正確性
async function checkContent(content, res) {
  if (content.length === 0) {
    res.status(422).json()
    return false
  }
  const Product = require(process.cwd() + '/models/product/product')
  const ProductVariant = require(process.cwd() + '/models/product/productVariant')
  let productIds = []
  let variantIds = []
  for (const item of content) {
    if (item.variant) {
      variantIds.push(item.variant.id)
    } else {
      productIds.push(item.id)
    }
  }
  let productList = []
  if (productIds.length !== 0) {
    productList = await Product.getList({ ids: productIds, status: 1 })
  }
  let variantList = []
  if (variantIds.length !== 0) {
    variantList = await ProductVariant.getList({ ids: variantIds, status: 1 })
  }
  
  let check = true
  let checkExist = true
  let newContet = []
  for (const i in content) {
    const item = content[i]
    if (item.variant) {
      check = checkVariant(item, variantList)
      checkExist = checkVariantExist(item, variantList)
      if (checkExist) {
        newContet.push(item)
      }
    } else {
      check = checkProduct(item, productList)
      checkExist = checkProductExist(item, productList)
      if (checkExist) {
        newContet.push(item)
      }
    }
  }
  
  if (!check || !checkExist) {
    res.status(422).json({content: newContet})
    return false
  } else return true
}

function checkProduct(contentItem, productList) {
  let check = true
  for (const item of productList) {
    if (item.name !== contentItem.name) {
      contentItem.name = item.name
      check = false
    }
    if (item.price !== contentItem.price) {
      contentItem.price = item.price
      check = false
    }
  }
  return check
}

function checkProductExist(contentItem, productList) {
  let check = false
  for (const item of productList) {
    if (item.id === contentItem.id) {
      check = true
    }
  }
  return check
}

function checkVariant(contentItem, variantList) {
  let check = true
  for (const item of variantList) {
    if (item.price !== contentItem.variant.price) {
      contentItem.variant.price = item.price
      check = false
    }
  }
  return check
}

function checkVariantExist(contentItem, variantList) {
  let check = false
  for (const item of variantList) {
    if (item.id === contentItem.variant.id) {
      check = true
    }
  }
  return check
}

function checkFooterInfo(footerInfo, clientFooterInfo, res) {
  let check = true
  if (footerInfo.subTotal !== clientFooterInfo.subTotal) {
    check = false
  }
  if (footerInfo.total !== clientFooterInfo.total) {
    check = false
  }
  if (!check) res.status(422).json({footerInfo: footerInfo})
  return check
}