<template>
	<div class="container my-3">
		<div class="row">
			<div class="col-md-6 mx-auto">
				<div class="mb-3">
					<span class="h3">登入</span>
					<span class="h5">
						&nbsp;&nbsp;/&nbsp;&nbsp;
						<router-link :to="'/register' + ($route.query.redirect ? '?redirect=' + $route.query.redirect : '')" class="link-underline-light">
							註冊
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
			    <label class="col-form-label">
			    	密碼
			    	<span class="text-decoration-underline fst-italic ms-2">
			    		<router-link to="/user/forgot">
			    			忘記密碼
			    		</router-link>
			    	</span>
			    </label>
			    <input type="password" class="form-control" v-model="formData.password" @focus="formValidClear()">
			    <div class="form-text text-danger">
			    	{{ formValidFeild('password') ? formValid.errors.password[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <button class="btn btn-primary" @click="login()">登入</button>
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
        password: "",
      },
  	}
  },
  methods: {
  	login() {
  		if (this.loading) return
  		const validator = wrapValidator(this.formData, {
		    email: 'required|string|email|max:64',
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
		  this.axios.post('/user/login', this.formData).then(response => {
		  	this.loading = false
      	this.formValid = {
          fails: false
        }
        let localUser = { id: response.data.user.id }
        localStorage.setItem('user', JSON.stringify(localUser))
        this.$store.commit('setLocalUser', localUser)
        // this.$store.commit('setUser', response.data.user)
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