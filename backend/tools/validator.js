let validatorjs = require('validatorjs');
let en = require('validatorjs/src/lang/en');

validatorjs.setMessages('en', en);

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
	
	validator.transType = function() {
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
	
	return validator
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
	content: {
		attributeNames: {
			id: '內容編號',
			name: '內容名稱',
		},
		enumerationValues: {
			push: ['all', '0', '1'],
			sortBy: ['id', 'hot_order']
		}
	},
	label: {
		attributeNames: {
			id: '分類編號',
			name: '分類名稱',
		},
		enumerationValues: {
			sortBy: ['id', 'hot_order']
		}
	},
	memberLabel: {
		attributeNames: {
			id: '會員分類編號',
			labelName: '會員分類名稱',
		},
	},
	news: {
		attributeNames: {
			id: '公告編號',
			name: '公告名稱',
		},
		enumerationValues: {
			push: ['all', '0', '1'],
			sortBy: ['id']
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