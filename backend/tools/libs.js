
async function authUserStoreRoleGroup (req, storeId, roleGroup) {
  
  if (!req.session.user) {
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
    
    if (!result) return false
    
    req.session.user.currentStore = {
      id: result.id,
      roleGroup: result.roleGroup,
      role: result.role,
    }
  }
  
  if (roleGroup.includes(req.session.user.currentStore.roleGroup)) {
    return true
  } else {
    return false
  }
}

async function authUserStoreRole (req, storeId, role) {
  
  if (!req.session.user) {
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
    
    if (!result) return false
    
    req.session.user.currentStore = {
      id: result.id,
      roleGroup: result.roleGroup,
      role: result.role,
    }
  }
  
  if (role.includes(req.session.user.currentStore.role)) {
    return true
  } else {
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

module.exports = {
  authUserStoreRoleGroup,
  authUserStoreRole,
	getIp,
	escape
}