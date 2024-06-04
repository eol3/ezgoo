import validatorjs from 'validatorjs';
import en from 'validatorjs/src/lang/en';
validatorjs.setMessages('en', en);
// validatorjs.useLang('zh');

// import zh_TW from 'validatorjs/src/lang/zh_TW';
// validatorjs.setMessages('zh_TW', zh_TW);

// validatorjs.useLang('zh_TW');

// 以下變更需和後端同步

validatorjs.register('script', function(value) {
	if (value.indexOf('script>') > 0) {
		return false
	} else return true
}, 'The :attribute phone number is not in the format XXX-XXX-XXXX.');

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

let errorMsg = {
	required: '請輸入:attribute',
	numeric: ':attribute必須是數字',
	string: ':attribute必須是字串',
  email: ':attribute格式不符',
  min: ':attribute長度至少為:min',
  max: ':attribute長度最多為:max',
  confirmed: "輸入兩次:attribute不相符",
  script: "請勿輸入不合法字串",
  digits: ":attribute必須為:digits碼",
  idStringArray: ":attribute 必須是特殊字串",
  enum: ":attribute 必須是特定字串",
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
				data[key] = (data[key] === 'true')
			} else if (rules[key].indexOf('numeric') > -1) {
				data[key] = Number(data[key])
			} else if (rules[key] === 'idStringArray') {
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
			name: '商店名稱',
		}
	},
	product: {
		attributeNames: {
			id: '產品編號',
			name: '產品名稱',
			status: '產品狀態'
		},
		enumerationValues: {
			statusQuery: ['all', '0', '1'],
			status: [0, 1],
			sortBy: ['id', 'name', 'hotOrder']
		}
	},
	post: {
		attributeNames: {
			id: '貼文編號',
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
			shippingMethod: [1, 2, 3],
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

// 以上變更需和後端同步

export default wrapValidator