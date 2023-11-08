import validatorjs from 'validatorjs';
import en from 'validatorjs/src/lang/en';

validatorjs.setMessages('en', en);

// 以下變更需和後端同步

validatorjs.register('script', function(value) { // requirement parameter defaults to null
	if (value.indexOf('script>') > 0) {
		return false
	} else return true
}, 'The :attribute phone number is not in the format XXX-XXX-XXXX.');

let errorMsg = {
	required: '請輸入:attribute',
	numeric: ':attribute必須是數字',
	string: ':attribute必須是字串',
  email: ':attribute格式不符',
  min: ':attribute長度至少為:min',
  max: ':attribute長度最多為:max',
  confirmed: "輸入兩次:attribute不相符",
  script: "請勿輸入不合法字串",
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
	}
	
	let validator = new validatorjs(data, rules, errorMsg)
	
	validator.setAttributeNames(attributeNames)
	
	return validator
}

const extModel = {
	store: {
		attributeNames: {
			account: '商店帳號',
		}
	},
	user: {
		attributeNames: {
			name: '姓名',
			email: 'E-mail',
			account: 'E-mail或手機',
		}
	},
	product: {
		attributeNames: {
			id: '商品編號',
			status: '商品狀態',
			categories: '商品分類',
		}
	},
	post: {
		attributeNames: {
			id: '貼文編號',
			status: '貼文狀態',
		}
	},
}

// 以上變更需和後端同步

export default wrapValidator