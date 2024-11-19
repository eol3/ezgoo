const router = require("express-promise-router")({ mergeParams: true })
const wrapValidator = require(process.cwd() + '/tools/validator')
const Store = require(process.cwd() + '/models/store/store')
const auth = require(process.cwd() + "/tools/middlewares.js").auth
const { authStore, authUserStoreRole, authUserStoreRoleGroup }= require(process.cwd() + '/tools/libs')

module.exports = router

router.get('/:storeId/dashboard', auth, async function(req, res, next) {
  
  const useData = {
		id: req.params.storeId
	}

  const validator = wrapValidator(useData, {
    id: 'required|numeric|min:1',
  }, 'store');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }
	
  if (!await authUserStoreRoleGroup(req, next, useData.id, 'manage')) {
  	return
  }
  
  let result = await Store.getOne(useData)
	
	if (!result) {
	  return next({statusCode: 404 })
	} else {
	  res.json(result)
	}
})

router.get('/account/:account', async function(req, res, next) {
  const useData = {
		account: req.params.account
	}

  const validator = wrapValidator(useData, {
	  account: 'required|string',
  }, 'store')

  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  let result = await Store.getOne({
    account: useData.account
  })
  
  if (!result) {
    return next({statusCode: 404 })
  } else {
    result.payment = JSON.parse(result.payment)
    result.shippingMethod = JSON.parse(result.shippingMethod)
    result.setting = JSON.parse(result.setting)
	  res.json(result)
	}

})

router.get('/:storeId', async function(req, res, next) {
	
  // status:
  // all: 全部, 0:未公開, 1:已公開, 2:僅展示，不能下單, 3:暫時關閉維護中, -1: 系統禁用
	const useData = {
		id: req.params.storeId,
    status: req.query.status,
	}
	
	const validator = wrapValidator(useData, {
	  id: 'required|numeric|min:1',
    status: 'enum:statusQuery', // 查詢簡化成三種 all: 全部, 0:未公開, 1:已公開,
  }, 'store')
  
  if (validator.fail) {
  	return next({statusCode: 400, ...validator.errors})
  }

  if (!await authStore(req, next, {
    storeId: useData.id,
    status: useData.status,
    role: ['owner', 'editor']
  })) return

  // let result = await Store.getOne({ account: useData.account })

  // if (!result) {
  //   return next({statusCode: 404 })
  // }
  
  // if (result.status === -1) {
  //   if (req.session.admin) {
  //     res.json(result)
  //   } else {
  //     return next({statusCode: 403, msg: 'System banned' })
  //   }
  // }

  // if (useData.status === '1') {
  //   if (result.status === 0) {
  //     return next({statusCode: 403, msg: 'Store not open' })
  //   } else if (result.status === 3) {
  //     return next({statusCode: 403, msg: 'Store maintaining' })
  //   }
  // }

  // if (req.store.thumbnail) {
  //   req.store.thumbnail = process.env.BASE_URL + req.store.thumbnail
  // }
  req.store.otherUrl = JSON.parse(req.store.otherUrl)
  req.store.payment = JSON.parse(req.store.payment)
  req.store.shippingMethod = JSON.parse(req.store.shippingMethod)
  req.store.setting = JSON.parse(req.store.setting)
  
  res.json(req.store)
  
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
    name: 'required|string|max:64',
  }, 'store');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }

  const userStore = require(process.cwd() + '/models/user/userStore')
  const userStoreList = await userStore.getList({ userId: req.session.user.id })
  if (userStoreList.length >= 5) {
    return res.status(422).json({ msg: '每個帳號不能創建超過5個商店，如需刪除商店請寫E-mail聯絡我們。' })
  }
  
  // 預設值
  useData.status = 0
  setDefaultValue(useData)

  result = await Store.create(useData)
  let newStoreId = result[0]

  result = await Store.getOne({ id: newStoreId })
  
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

router.put('/:storeId', auth, async function(req, res, next) {
  const useData = {
    id: req.params.storeId,
    status: req.body.status,
    name: req.body.name,
    about: req.body.about,
    thumbnail: req.body.thumbnail,
    otherUrl: req.body.otherUrl,
    payment: req.body.payment,
    shippingMethod: req.body.shippingMethod,
    setting: req.body.setting,
    updateBy: req.session.user.id,
  }
  
  const validator = wrapValidator(useData, {
    id: 'required|numeric|min:1',
    status: 'enum:status',
    name: 'string|max:64',
    about: 'string',
    thumbnail: 'string|max:128',
  }, 'store');
  
  if (validator.fail) {
    next({statusCode: 400, ...validator.errors}); return;
  }

  // 還要檢查json格式 payment, shippingMethod, setting

  if (!await authUserStoreRole(req, next, useData.id, ['owner', 'editor'])) {
  	return
  }
  
  if (useData.status === 1) {
    // 設定商店開放，必須設定付款方式與運送方式
    result = await Store.getOne({
      id: useData.id
    })

    result.payment = JSON.parse(result.payment)
    result.shippingMethod = JSON.parse(result.shippingMethod)

    if (result.payment.length === 0) return next({statusCode: 422, msg: '尚會設定付款方式'})
    if (result.shippingMethod.length === 0) return next({statusCode: 422, msg: '尚會設定運送方式'})
      
  }

  checkDefaultValue(useData)

  useData.otherUrl = JSON.stringify(useData.otherUrl)
  useData.payment = JSON.stringify(useData.payment)
  useData.shippingMethod = JSON.stringify(useData.shippingMethod)
  useData.setting = JSON.stringify(useData.setting)
  
  result = await Store.update({ id: useData.id }, useData)
  
  res.status(200).json();
})

// 設定商家預設值
function setDefaultValue(useData) {
  useData.otherUrl = []
  useData.payment = []
  useData.shippingMethod = []

  useData.setting = {
    untilAmountFreeShipping: null, // 訂單達到多少免運費
    allowOrderWithoutLogIn: true // 允許未登入下單
  }

  useData.otherUrl = JSON.stringify(useData.otherUrl)
  useData.payment = JSON.stringify(useData.payment)
  useData.shippingMethod = JSON.stringify(useData.shippingMethod)
  useData.setting = JSON.stringify(useData.setting)

}


function checkDefaultValue(useData) {
  let defaultPayment = [
    {
      id: 1,
      name: '匯款',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 2,
      name: '取貨付款',
      enable: false,
      tip: '',
      fee: 0,
    }
  ]
  if (useData.payment) {
    for (let dItem of defaultPayment) {
      for (let item of useData.payment) {
        if (dItem.id === item.id) {
          delete dItem.enable
          dItem.tip = item.tip
          dItem.fee = item.fee
        }
      }
    }
  }
  let defaultShippingMethod = [
    {
      id: 1,
      name: '宅配',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 2,
      name: '到店取貨',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 3,
      name: '超商取貨',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 4,
      name: '面交',
      enable: false,
      tip: '',
      fee: 0,
    },
  ]
  if (useData.shippingMethod) {
    for (let dItem of defaultShippingMethod) {
      for (let item of useData.shippingMethod) {
        if (dItem.id === item.id) {
          delete dItem.enable
          dItem.tip = item.tip
          dItem.fee = item.fee
        }
      }
    }
  }
  // let defaultSetting = {
  //   untilAmountFreeShipping: null, // 訂單達到多少免運費
  //   allowOrderWithoutLogIn: true // 允許未登入下單
  // }
}