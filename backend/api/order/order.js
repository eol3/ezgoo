const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Order = require(process.cwd() + '/models/order/order')
const OrderLog = require(process.cwd() + '/models/order/orderLog')
const { authStore }= require(process.cwd() + '/tools/libs')
const auth = require(process.cwd() + "/tools/middlewares.js").auth

module.exports = router

/*
status: -1=取消,0=未成立,1=訂單成立,2=接受訂單,3=出貨,4=到貨,5=完成,6=退貨,7=收到退貨重新出貨,8=未取貨
payment: 1=匯款,2=到店付款,3=信用卡
paymentStatus: 0=待付款,1=已付款,2=已付款(由第三方api)
shippingMethod: 1=宅配,2=到店取貨,3=超商取貨
*/

router.get('/count', auth, async function(req, res, next) {
	
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
  
  if (useData.storeId) {
    if (!await authStore(req, next, {
      storeId: useData.storeId,
      status: useData.status,
      role: ['owner', 'editor']
    })) return
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
		sortBy: req.query.sortBy,
	  orderBy: req.query.orderBy,
		limit: req.query.limit || 10,
		offset: req.query.offset || 0
	}
	
	const validator = wrapValidator(useData, {
		storeId: 'numeric|min:1',
		status: 'enum:statusQuery', // all:查詢全部, 0:未公開, 1:已公開
	  sortBy: 'string|enum:sortBy',
	  orderBy: 'string|enum:orderBy',
	  limit: 'numeric|min:0',
	  offset: 'numeric|min:0'
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

router.put('/:orderId', async function(req, res, next) {
	
	const useData = {
    id: req.params.orderId,
    storeId: req.query.storeId,
    status: req.body.status,
    payment: req.body.payment,
    paymentStatus: req.body.paymentStatus,
    shippingMethod: req.body.shippingMethod,
    recipientInfo: req.body.recipientInfo,
    payerInfo: req.body.payerInfo,
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

  // check items
  // precheck()
  
  let result = await Order.getOne({ id: useData.id })

  if (useData.storeId) {
    if (!await authStore(req, next, {
      storeId: useData.storeId,
      role: ['owner', 'editor']
    })) return
  } else {
    if (result.userId === -1 && result.status === 0 && !req.session.user) {
      // 由商家開立訂單給消費者，或者消費者無登入下單
      // 僅限狀態0可讓訪客無狀態修改
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
    
    // 消費者不能變更付款狀態，由商家變更
    delete useData.paymentStatus

    if (result.status === 0 && useData.status === -1) {
      // 取消訂單免驗證其他欄位，也不能修改其他欄位
      delete useData.payment
      delete useData.shippingMethod
      delete useData.recipientInfo
      delete useData.payerInfo
      delete useData.footerInfo
    } else if (result.status === 0) {

      let ruleObj = {
        status: 'required|enum:status',
        'payerInfo.name': 'required|string',
        'payerInfo.tel': 'required|string',
        'payerInfo.email': 'required|email|string',
        'recipientInfo.name': 'required|string',
        'recipientInfo.tel': 'required|string',
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

      // 消費者僅限變更訂單狀態-1 1
      if (![-1, 1].includes(useData.status)) {
        next({statusCode: 403})
        return
      }

      // 檢查付款方式與運送方式
      const Store = require(process.cwd() + '/models/store/store')
      const storeInfo = await Store.getOne({ id: result.storeId })
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

      useData.recipientInfo = JSON.stringify(useData.recipientInfo)
      useData.payerInfo = JSON.stringify(useData.payerInfo)
      
      // compute footer info
      result.content = JSON.parse(result.content)
      useData.footerInfo = { subTotal: getSubTotal(result.content) }
      let shippingFee = getShippingFee(storeInfo.shippingMethod, useData.shippingMethod)
      if (shippingFee) {
        useData.footerInfo.shippingFee = shippingFee
      }
      storeInfo.setting = JSON.parse(storeInfo.setting)
      let freeShipping = getFreeShipping(storeInfo.setting, useData.footerInfo)
      if (freeShipping) {
        delete useData.footerInfo.shippingFee
        useData.footerInfo.freeShipping = true
      }
      let total = getTotal(useData.footerInfo)
      if (total) {
        useData.footerInfo.total = total
      }
      
      useData.footerInfo = JSON.stringify(useData.footerInfo)
      
    } else {
      // 訂單0:未成立以外，消費者不能變更狀態
      if (useData.status) {
        next({statusCode: 403})
        return
      }
      // 訂單0:未成立以外不能變更其他資訊
      delete useData.payment
      delete useData.shippingMethod
      delete useData.recipientInfo
      delete useData.payerInfo
      delete useData.footerInfo
    }
  }
  
  addOrderLog(result, useData)
  
  result = await Order.update({ id: useData.id }, useData)
  
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
function preCheckContent(content) {

}