let validatorjs = require('validatorjs');
// let zh_TW = require('validatorjs/src/lang/zh_TW');
validatorjs.useLang('zh')
// validatorjs.setMessages('zh_TW', zh_TW);

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
		if (!Number(arr[i])) {
			return false
		}
	}
	return true
}, 'The :attribute have to be spec string.');

let errorMsg = {
	required: '請輸入:attribute',
	numeric: ':attribute必須是數字',
	string: ':attribute必須是字串',
	boolean: ':attribute必須是布林值',
  email: ':attribute格式不符',
  min: ':attribute長度至少為:min',
  max: ':attribute長度最多為:max',
  confirmed: "輸入兩次:attribute不相符",
  script: "請勿輸入不合法字串",
  digits: ":attribute必須為:digits碼",
}

let attributeNames = {
	account: '帳號',
	password: '密碼',
	pageNum: '頁數',
	pageSize: '每頁筆數'
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
		// transType(data, rules)
		return {
			fail: false
		}
	}
	
	return validator
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
		},
		enumerationValues: {
			push: ['all', '0', '1'],
			sortBy: ['id', 'name', 'hotOrder']
		}
	},
	post: {
		attributeNames: {
			id: '貼文編號',
			status: '貼文狀態',
		}
	},
}

module.exports = wrapValidator