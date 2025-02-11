import { ref } from 'vue'

export default () => {
	const formValid = ref({ fails: false })
	function formValidFeild(feildName) {
		if (formValid.value.fails) {
      if (formValid.value.errors[feildName] === undefined) {
        return false
      } else return true
    } else return false
	}
	function formValidClear() {
		if (formValid.value.fails) {
    	formValid.value = {
        fails: false,
      }
  	}
	}
  return {
    formValid,
    formValidFeild,
    formValidClear
  }
}


// 不確定有沒有用先這這
// 前端用

export function formValidFeild(formValid, feildName) {
  if (formValid.fails) {
    if (formValid.errors[feildName] === undefined) {
      return false
    } else return true
  } else return false
}

export function formValidClear(formValid) {
  if (formValid.fails) {
  	formValid = {
      fails: false,
    }
	}
}