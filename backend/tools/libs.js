
module.exports = {
  authUserStoreRoleGroup,
  authUserStoreRole,
	getIp,
	escape
}

async function authUserStoreRoleGroup (req, next, storeId, roleGroup) {
  
  if (!req.session.user) {
    next({statusCode: 403, msg: 'No login' })
    return false
  }
  
  if (req.session.user.currentStore === undefined 
    || req.session.user.currentStore.id !== storeId) {
    
    const userStore = require(process.cwd() + '/models/userStore')
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
    
    const userStore = require(process.cwd() + '/models/userStore')
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
