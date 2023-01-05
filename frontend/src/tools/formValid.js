import { ref } from 'vue'

export default (props) => {
	const formValid = ref({ fails: false })
	function formValidFeild(feildName) {
		if (this.formValid.fails) {
      if (this.formValid.errors[feildName] === undefined) {
        return false
      } else return true
    } else return false
	}
	function formValidClear() {
		if (this.formValid.fails) {
    	this.formValid = {
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