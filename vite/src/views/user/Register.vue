<template>
	<div class="container my-3">
		<div class="row">
			<div class="col-md-6 mx-auto">
				<div class="mb-3">
					<span class="h3">註冊</span>
					<span class="h5">
						&nbsp;&nbsp;/&nbsp;&nbsp;
						<router-link :to="'/login' + ($route.query.redirect ? '?redirect=' + $route.query.redirect : '')" class="link-underline-light">
							登入
						</router-link>
					</span>
				</div>
				<div class="mb-1">
			    <label class="col-form-label">E-mail</label>
			    <input type="text" class="form-control" v-model="formData.email" @focus="formValidClear()">
			    <div class="form-text text-danger">
			    	{{ formValidFeild('email') ? formValid.errors.email[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <div class="mb-1">
			    <label class="form-label">認證碼</label>
			    <div class="input-group">
			      <input name="verifyCode" class="form-control" pattern="\d*" type="text" maxlength="6" v-model="formData.verifyCode" @focus="formValidClear()">
				    <button id="send_code" class="btn btn-outline-primary" type="button" @click="getVerifyCode()">
							發送認證碼
						</button>
					</div>
					<div class="form-text text-danger">
			    	{{ formValidFeild('verifyCode') ? formValid.errors.verifyCode[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <div class="mb-1">
			    <label class="col-form-label">密碼</label>
			    <input type="password" class="form-control" v-model="formData.password" @focus="formValidClear()">
			    <div class="form-text text-danger">
			    	{{ formValidFeild('password') ? formValid.errors.password[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <button class="btn btn-primary" @click="register()">註冊</button>
		  </div>
		</div>
	</div>
</template>

<script>
import formValidTools from '@/tools/formValid'
import wrapValidator from '@/tools/validator'

export default {
	setup() {
    const { formValid, formValidFeild, formValidClear } = formValidTools();
    
    return {
      formValid,
      formValidFeild,
      formValidClear
    }
  },
  data() {
  	return {
  		loading: false,
  		formData: {
        email: "",
        verifyCode: "",
        password: "",
      },
  	}
  },
  methods: {
  	register() {
  		if (this.loading) return
  		const validator = wrapValidator(this.formData, {
		    email: 'required|string|email|max:64',
		    verifyCode: 'required|numeric|digits:6',
		    password: 'required|min:6|max:32',
		  }, 'user');
		  if (validator.fail) {
		  	this.formValid = {
          fails: true,
          ...validator.errors
        }
        return
		  }
		  this.loading = true
		  this.axios.post('/user/register', this.formData).then(response => {
		  	this.loading = false
      	this.formValid = {
          fails: false
        }
        localStorage.setItem('user', JSON.stringify(response.data.user))
        this.$store.commit('setUser', response.data.user)
        if (this.$route.query.redirect) {
					this.$router.push(decodeURI(this.$route.query.redirect))
				} else {
					this.$router.push('/')
				}
        this.$store.dispatch('showAlert', {
					type: 'success',
        	text: response.data.msg
				})
		  }).catch(error => {
      	this.loading = false
      	if (error.response.status === 400) {
	        this.formValid = {
	          fails: true,
	          errors: error.response.data.errors
	        }
      	}
      });
  	}
  }
}
</script>