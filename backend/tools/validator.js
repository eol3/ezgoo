let validatorjs = require('validatorjs');
let en = require('validatorjs/src/lang/en');

validatorjs.useLang('zh_TW');

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
  script: "請勿輸入不合法字串",
  digits: ":attribute必須為:digits碼",
  idStringArray: ":attribute 必須是特殊字串",
  enum: ":attribute 必須是特殊字串",
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
	member: {
		attributeNames: {
			email: 'E-mail',
			account: '帳號',
			nickname: '暱稱',
			verify_code: '認證碼',
			password: '密碼',
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