
export function listToTree(list) {
  var map = {}, node, roots = [], i;
  
  for (i = 0; i < list.length; i += 1) {
    if (list[i].parent_id === null) list[i].parent_id = 0
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
    list[i].hasExpand = false;
    list[i].subExpand = false;
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parent_id !== 0) {
      list[map[node.parent_id]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}


function serialize(obj) {
  var str = [];
  for (var p in obj)
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

// export function getStoreQeury(store, route, isObj) {
// 	if (isObj === undefined) isObj = true
// 	let obj = {}
// 	if (store.state.store === null) {
//     obj.store_account = route.params.store_id
//   } else {
//     if (route.params.store_id === store.state.store.account) {
//       obj.store_id = store.state.store.id
//     } else {
//       obj.store_account = route.params.store_id
//     }
//   }
//   if (isObj) {
//     return obj	
//   } else {
//     return serialize(obj)
//   }
// }

export function getUser(store, route, isObj) {
	if (isObj === undefined) isObj = true
	let obj = {}
	if (store.state.user !== null) {
    obj.user_id = store.state.user.id
  }
	return obj
}

