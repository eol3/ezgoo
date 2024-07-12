
module.exports = {
  authStore,
  authUserStoreRoleGroup,
  authUserStoreRole,
	getIp,
	escape
}

// 驗證 store 請求狀態 使用者
async function authStore (req, next, checkObj) {
  const store = require(process.cwd() + '/models/store/store')
  let result = await store.getOne({
    id: checkObj.storeId
  })
  if (!result) {
    next({statusCode: 404 })
    return false
  }
  if (result.status === -1 && !req.session.admin) {
    next({statusCode: 403, msg: 'System banned' })
    return false
  }
  // 附帶商店資訊，讓後面可以用
  req.store = result

  // 設定session
  await setSessionUserCurrentStore(req, checkObj.storeId)
  let checkRole = false
  checkRole = checkUserSession(req, checkObj)
  
  // 如果身分檢查通過則可忽略store狀態
  if (!checkRole && checkObj.status === '1') {
    // 跟store相關資源，如是請求公開狀態，需先依照store狀態回應
    if (result.status === 0) {
      next({statusCode: 403, msg: 'Store not open' })
      return false
    } else if (result.status === 3) {
      next({statusCode: 403, msg: 'Store maintaining' })
      return false
    }
  } else if (!checkRole){
    // 未通過身分驗證
    if (!req.session.user) {
      next({statusCode: 403, msg: 'No login' }) //前端判斷關鍵字
      return false
    } else {
      next({statusCode: 403 })
      return false
    }
  } else {
    return true
  }
  return true
}
// next({statusCode: 403, msg: 'No login' }) //前端判斷關鍵字
async function setSessionUserCurrentStore(req, storeId) {
  if (!req.session.user) return false

  if (storeId === undefined) return false
  
  if (req.session.user.currentStore === undefined 
    || req.session.user.currentStore.id !== storeId) {
    
    const userStore = require(process.cwd() + '/models/user/userStore')
    let result = await userStore.getOne({
      userId: req.session.user.id,
      storeId: storeId,
    })
    
    if (!result) {
      return false
    }
    
    req.session.user.currentStore = {
      id: result.id,
      roleGroup: result.roleGroup,
      role: result.role,
    }
  }
}

function checkUserSession(req, checkObj) {
  if (!req.session.user) return false
  if (!req.session.user.currentStore) return false
  if (checkObj.role) {
    if (checkObj.role.includes(req.session.user.currentStore.role)) {
      return true
    }
  } else if (checkObj.group) {
    if (checkObj.group.includes(req.session.user.currentStore.roleGroup)) {
      return true
    }
  }
  return false
}

async function authUserStoreRoleGroup (req, next, storeId, roleGroup) {
  
  if (!req.session.user) {
    next({statusCode: 403, msg: 'No login' })
    return false
  }
  
  if (req.session.user.currentStore === undefined 
    || req.session.user.currentStore.id !== storeId) {
    
    const userStore = require(process.cwd() + '/models/user/userStore')
    let result = await userStore.getOne({
      userId: req.session.user.id,
      storeId: storeId,
      roleGroup: roleGroup
    })
    
    if (!result) {
      next({statusCode: 403 })
      return false
    }
    
    req.session.user.currentStore = {
      id: result.id,
      roleGroup: result.roleGroup,
      role: result.role,
    }
  }
  
  if (roleGroup.includes(req.session.user.currentStore.roleGroup)) {
    return true
  } else {
    next({statusCode: 403 })
    return false
  }
}

async function authUserStoreRole (req, next, storeId, role) {
  
  if (!req.session.user) {
    next({statusCode: 403, msg: 'No login' }) //前端判斷關鍵字
    return false
  }

  if (storeId === undefined) {
    next({statusCode: 403 })
    return false
  }
  
  if (req.session.user.currentStore === undefined 
    || req.session.user.currentStore.id !== storeId) {
    
    const userStore = require(process.cwd() + '/models/user/userStore')
    let result = await userStore.getOne({
      userId: req.session.user.id,
      storeId: storeId,
      role: role
    })
    
    if (!result) {
      next({statusCode: 403 })
      return false
    }
    
    req.session.user.currentStore = {
      id: result.id,
      roleGroup: result.roleGroup,
      role: result.role,
    }
  }
  
  if (role.includes(req.session.user.currentStore.role)) {
    return true
  } else {
    next({statusCode: 403 })
    return false
  }
}


/*
 * https://stoner609.github.io/2018/12/19/20181219-node-getMachineName/
 */

function getIp(req) {
	return (req.headers["x-forwarded-for"] || "").split(",").pop() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

function escape(s) {
    let lookup = {
        '&': "&amp;",
        '"': "&quot;",
        '\'': "&apos;",
        '<': "&lt;",
        '>': "&gt;"
    };
    return s.replace( /[&"'<>]/g, c => lookup[c] );
}
