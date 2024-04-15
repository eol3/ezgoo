import router from "../router/index";
import store from "../store/index";
import { axios } from "@/tools/request";

export function checkLogin(type) {
  if (!store.state.localUser) {
		userRedirect(type)
	} else if (!store.state.user) {
  	axios.get('/user').then(response => {
      store.commit('setUser', response.data)
  	}).catch(error => {
  	  if (error.response.status === 403) {
        userRedirect(type)
      }
  	})
	}
}

export function userRedirect(type) {
  if (!type) type = 'login'
  store.dispatch('userLogout')
  store.dispatch("showAlert", {
    type: "warning",
    text: (type === 'login') ? '請先登入' : '請先註冊'
  })
  
  router.push('/' + type + '?redirect=' + encodeURI(window.location.pathname))
}


export function listToTree(list) {
  var map = {}, node, roots = [], i;
  
  for (i = 0; i < list.length; i += 1) {
    if (list[i].parentId === null) list[i].parentId = 0
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
    if (!list[i].hasExpand) list[i].hasExpand = false;
    if (!list[i].subExpand) list[i].subExpand = false;
  }
  
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parentId !== 0) {
      // console.log(list)
      // console.log(node)
      // console.log(node.parentId)
      // console.log(map[node.parentId])
      list[map[node.parentId]].children.push(node);
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

