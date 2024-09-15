let validatorjs = require('validatorjs');
// let en = require('validatorjs/src/lang/en');

validatorjs.useLang('zh_TW');

validatorjs.register('script', function(value) {
	if (value.indexOf('script>') > 0) {
		return false
	} else return true
}, 'The :attribute phone number is not in the format XXX-XXX-XXXX.');

validatorjs.register('object', function(value) {
	if (typeof value === 'object' && !Array.isArray(value) && value !== null) return true
	else return false
}, ':attribute value must be object');

validatorjs.register('array', function(value) {
	if (Array.isArray(value)) return true
	else return false
}, ':attribute value must be array');

validatorjs.register('enum', function(value, requirement, attribute) {
	if (currentEnum[requirement].includes(value)) {
		return true
	} else return false
}, ':attribute value have to be spec word.');

validatorjs.register('idStringArray', function(value) {
	let arr = value.split('-')
	for (let i in arr) {
		if (arr[i] === '0') return true
		else if (!Number(arr[i])) {
			return false
		}
	}
	return true
}, 'The :attribute have to be spec string.');

validatorjs.register('length', function(value, requirement) { // requirement parameter defaults to null
	if (value.toString().length === Number(requirement)) return true
	else return false;
}, 'The :attribute length must be :length');

let errorMsg = {
  script: "請勿輸入不合法字串",
  digits: ":attribute必須為:digits碼",
  idStringArray: ":attribute 必須是特殊字串",
  enum: ":attribute 必須是特定字串",
	length: ":attribute 長度必須是:length"
}

let attributeNames = {
	account: '帳號',
	password: '密碼',
	pageNum: '頁數',
	pageSize: '每頁筆數',
	sortBy: '排序欄位',
	orderBy: '排序方式',
}

function wrapValidator (data, rules, extModelName) {
	
	if (extModelName !== undefined) {
		errorMsg = {
			...errorMsg,
			...extModel[extModelName].errorMsg
		}
		attributeNames = {
			...attributeNames,
			...extModel[extModelName].attributeNames
		}
		currentEnum = {
			...currentEnum,
			...extModel[extModelName].enumerationValues
		}
	}
	
	let validator = new validatorjs(data, rules, errorMsg)
	
	validator.setAttributeNames(attributeNames)

	if (validator.fails()) {
		return {
			fail: true,
			errors: validator.errors
		}
	} else {
		transType(data, rules)
		return {
			fail: false
		}
	}
}

function transType(data, rules) {
	for (const key in rules) {
		if (data[key]) {
			if (rules[key].indexOf('boolean') > -1) {
				if (typeof data[key] === 'string') {
					data[key] = (data[key] === 'true')
				}
			} else if (rules[key].indexOf('numeric') > -1) {
				// data[key] = Number(data[key])
			} else if (rules[key].indexOf('idStringArray') > -1) {
				let arr = data[key].split('-')
				for (let i in arr) {
					arr[i] = Number(arr[i])
				}
				data[key] = arr
			}
		}
	}
}

var currentEnum = {
	orderBy: ['asc', 'desc']
}

const extModel = {
	user: {
		attributeNames: {
			email: 'E-mail',
			account: '帳號',
			name: '姓名',
			nickname: '暱稱',
			verifyCode: '認證碼',
			password: '密碼',
		}
	},
	store: {
		attributeNames: {
			id: '商店編號',
			name: '商店名稱',
		},
		enumerationValues: {
			statusQuery: ['all', '0', '1', '2', '3', '-1'],
			status: [0, 1, 2, 3, -1],
		}
	},
	storeImage: {
		attributeNames: {
			type: '商店圖片類型',
		},
		enumerationValues: {
			statusQuery: ['all', '0', '1'],
			type: ['0', '1']
		}
	},
	product: {
		attributeNames: {
			id: '產品編號',
			storeId: '商店編號',
			name: '產品名稱',
			status: '產品狀態'
		},
		enumerationValues: {
			statusQuery: ['all', '0', '1'],
			status: [0, 1],
			sortBy: ['id', 'name', 'priority']
		}
	},
	post: {
		attributeNames: {
			id: '貼文編號',
			storeId: '商店編號',
			status: '貼文狀態',
		},
		enumerationValues: {
			statusQuery: ['all', '0', '1'],
			status: [0, 1],
			sortBy: ['id', 'priority']
		}
	},
	order: {
		attributeNames: {
			id: '訂單編號',
			storeId: '商店編號',
			status: '訂單狀態',
			'payerInfo.name': '姓名',
			'payerInfo.tel': '電話',
			'payerInfo.email': 'E-mail',
			'recipientInfo.name': '收件人姓名',
			'recipientInfo.tel': '收件人電話',
			'recipientInfo.address': '地址',
			'recipientInfo.supermarketStoreName': '超商/門市資訊',
		},
		enumerationValues: {
			statusQuery: ['all', '-1', '0', '1', '2', '3', '4', '5', '6', '7'],
			status: [-1, 0, 1, 2, 3, 4, 5, 6, 7],
			payment: [1, 2, 3],
			paymentStatus: [0, 1, 2],
			shippingMethod: [1, 2, 3, 4],
			sortBy: ['id', 'createAt', 'updateAt']
		}
	},
	event: {
		attributeNames: {
			id: '優惠編號',
			name: '優惠名稱',
			status: '優惠狀態'
		},
		enumerationValues: {
			statusQuery: ['all', '0', '1'],
			status: [0, 1],
			sortBy: ['id', 'createAt', 'updateAt']
		}
	},
}

module.exports = wrapValidator