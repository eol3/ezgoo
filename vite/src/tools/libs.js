import router from "../router/index";
import store from "../store/index";
import { axios } from "@/tools/request";

export function setHead(data) {

  let url = 'https://www.ezgoo.biz/'
  let title = 'EzGoo - 易購網購物平台'
  let description = 'EzGoo - 易購網購物平台，提供簡單容易使用的系統介面給商家與消費者使用'
  let keywords = '購物平台,開店系統,電子商務平台,網路購物'
  let imageUrl = '/logo.png'

  if (data.title) {
  	title = data.title + ' | EzGoo - 易購網購物平台'
  }

  if (data.description) {
    description = data.description
  }

  if (data.keywords) {
    keywords = data.keywords + ',購物平台,開店系統,電子商務平台,網路購物'
  }

  if (data.image) {
    imageUrl = data.image
  }

  if (data.url) {
    url = data.url
  }
  
  document.title = title
	document.querySelector('meta[name="title"]').setAttribute("content", title)
	document.querySelector('meta[name="description"]').setAttribute("content", description)
	document.querySelector('meta[name="keywords"]').setAttribute("content", keywords)
	
	document.querySelector('meta[property="og:url"]').setAttribute("content", url)
	document.querySelector('meta[property="og:title"]').setAttribute("content", title)
	document.querySelector('meta[property="og:description"]').setAttribute("content", description)
	document.querySelector('meta[property="og:image"]').setAttribute("content", imageUrl)
	
	document.querySelector('meta[property="twitter:url"]').setAttribute("content", url)
	document.querySelector('meta[property="twitter:title"]').setAttribute("content", title)
	document.querySelector('meta[property="twitter:description"]').setAttribute("content", description)
	document.querySelector('meta[property="twitter:image"]').setAttribute("content", imageUrl)
  
}

export async function mergeCart() {
  let response = await axios.get('/user/cart')
  let cart = response.data.content
  var localCart = localStorage.getItem("cart")
  if (!localCart) {
    localStorage.setItem("cart", JSON.stringify(cart))
  } else {
    localCart = JSON.parse(localCart)
    for (const storeItem of localCart) {
      // let result = {}
      for (const product of storeItem.content) {
        addProdutToCart(cart, storeItem.store, product)
      }
    }
    let cartStr = JSON.stringify(cart)
    localStorage.setItem("cart", cartStr)
    syncToServer(cart, false)
  }
  localStorage.setItem("cartIsRead", response.data.isRead)
  store.commit('setCart', {
		number: getCartItemNumber(cart),
		isRead: response.data.isRead
	})
}

// product 必須包含choiceNumber, selectedOptions, variant, proudctVariantPrice
export function setCart(storeInfo, product) {
  
  var cart = localStorage.getItem("cart")
  if (!cart) {
    cart = [{
      store: {
        id: storeInfo.id,
        name: storeInfo.name,
        thumbnail: storeInfo.thumbnail,
      },
      content: []
    }]
  } else {
    cart = JSON.parse(cart)
  }

  addProdutToCart(cart, storeInfo, product)

  if (localStorage.getItem("user")) {
    syncToServer(cart, false)
  }

  store.commit('setCart', {
		number: getCartItemNumber(cart),
		isRead: false
	})
  localStorage.setItem("cartIsRead", false)

  let cartStr = JSON.stringify(cart)
  localStorage.setItem("cart", cartStr)
}

export function getCartItemNumber(cart) {
  let number = 0
	for (const storeInfo of cart) {
    if (!storeInfo.content) return number
		for (const product of storeInfo.content) {
			number += 1
		}
	}
  return number
}

function addProdutToCart(cart, storeInfo, product) {

  // 刪除多餘欄位
  storeInfo = {
    id: storeInfo.id,
    name: storeInfo.name,
    thumbnail: storeInfo.thumbnail,
  }

  product = {
    id: product.id,
    name: product.name,
    price: product.price,
    choiceNumber: product.choiceNumber,
    variant: product.variant,
    selectedOptions: product.selectedOptions,
    thumbnail: product.thumbnail
  }

  let findStore = false
  for (const store of cart) {
    if (store.store.id === storeInfo.id) findStore = true
  }

  if (!findStore) {
    cart.push({ 
      store: storeInfo,
      content: []
    })
  }
  
  for (const store of cart) {
    if (store.store.id === storeInfo.id) {
      store.store = storeInfo
      addProdutToStoreCart(store.content, product)
    }
  }
}

function addProdutToStoreCart(content, product) {
  let firstKey = false
  let findProduct = false
  for (let i in content) {
    if (content[i].id === product.id && !content[i].variant && !firstKey) {
      firstKey = Number(i)
      break;
    }
  }
  for (let i in content) {
    if (content[i].id === product.id && isSame(content[i].selectedOptions, product.selectedOptions)) {
      content[i].choiceNumber += product.choiceNumber
      findProduct = true
      break;
    }
  }

  if (!findProduct) {
    if (firstKey === false) {
      content.push(product)
    } else {
      // 變異商品加在主商品後面
      firstKey += 1
      content.splice(firstKey, 0, product)
    }
  }
  // if (firstKey) {
  //   content.splice(firstKey, 0, product)
  // } else if (!findProduct) {
  //   content.push(product)
  // }
}

// 同步到伺服器
export async function syncToServer(cart, isRead = undefined) {
  await axios({
    method: 'put',
    url: '/user/cart',
    data: {
      content: cart,
      isRead: isRead,
    }
  })
}

export function isSame(array1, array2) {
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

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


export function getUser(store, route, isObj) {
	if (isObj === undefined) isObj = true
	let obj = {}
	if (store.state.user !== null) {
    obj.user_id = store.state.user.id
  }
	return obj
}


function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    // var msg = successful ? 'successful' : 'unsuccessful';
    // console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    // console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

