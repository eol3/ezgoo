<template>
	<div class="row">
		<div class="col-12 col-md-8">
			<div class="mb-1">
				<label class="col-form-label">E-mail</label>
				<input type="text" class="form-control" v-model="user.email" readonly>
		  </div>
			<div class="mb-1">
				<label class="col-form-label">姓名</label>
				<input type="text" class="form-control" v-model="formData.name" @focus="formValidClear()">
		    <div class="form-text text-danger">
		    	{{ formValidFeild('name') ? formValid.errors.name[0] : '&nbsp;' }}
		    </div>
		  </div>
			<div class="mb-1">
		    <label class="col-form-label">密碼</label>
		    <input type="password" class="form-control" v-model="formData.password" @focus="formValidClear()">
		    <div class="form-text text-danger">
		    	{{ formValidFeild('password') ? formValid.errors.password[0] : '&nbsp;' }}
		    </div>
		  </div>
			<div class="row mt-3">
				<div class="text-center">
					<button class="btn btn-outline-success" @click="save()">儲存</button>
				</div>
			</div>
			<hr />
			<div class="row mt-3">
				<div class="text-center">
					<button class="btn btn-outline-primary" @click="logout()">登出</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import formValidTools from '@/tools/composition/formValid'
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
  		user: {
  			email: "",
  		},
  		formData: {
        name: "",
        password: "",
      },
  	}
  },
  created() {
  	this.axios.get('/user/profile').then(response => {
  		this.user.email = response.data.email
  		this.formData.name = response.data.name
  	})
  },
	methods: {
		logout() {
			if (this.loading) return
			this.loading = true
			this.axios.post('/user/logout').then(response => {
				this.loading = false
				
				this.$store.dispatch('userLogout')
				this.$store.dispatch('showAlert', {
					type: 'success',
        	text: response.data.msg
				})
				
				this.$router.push('/')
			})
		},
		save() {
			if (this.loading) return
			this.loading = true
			this.axios.put('/user/profile', this.formData).then(response => {
				this.loading = false
				this.$store.dispatch('showAlert', {
					type: 'success',
        	text: response.data.msg
				})
			})
		}
	}
}

</script>