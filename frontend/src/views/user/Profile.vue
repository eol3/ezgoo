<template>
	<div class="row">
		<div class="col-12 col-md-8">
			<div class="mb-1">
				<label class="col-form-label">E-mail</label>
				<input type="text" class="form-control" v-model="user.email" readonly disabled>
		  </div>
			<div class="mb-1">
				<label class="col-form-label">姓名</label>
				<input type="text" name="fname" class="form-control" v-model="formData.name" @focus="formValidClear()">
		    <div class="form-text text-danger">
		    	{{ formValidFeild('name') ? formValid.errors.name[0] : '&nbsp;' }}
		    </div>
		  </div>
			<div class="mb-1">
				<label class="col-form-label">手機號碼</label>
				<input type="text" name="phone" class="form-control" v-model="formData.phone">
				<div class="form-text text-danger">
		    	{{ formValidFeild('phone') ? formValid.errors.phone[0] : '&nbsp;' }}
		    </div>
		  </div>
			<div class="mb-1">
				<label class="col-form-label">地址</label>
				<input type="text" name="address" class="form-control" v-model="formData.address">
				<div class="form-text text-danger">
		    	{{ formValidFeild('address') ? formValid.errors.address[0] : '&nbsp;' }}
		    </div>
		  </div>
			<div class="row my-2">
				<div class="text-center">
					<button class="btn btn-outline-success" @click="save()">儲存</button>
				</div>
			</div>
			<hr />
			<div class="mb-1">
		    <label class="col-form-label">更改密碼</label>
				<div class="input-group">
		    	<input type="password" class="form-control" v-model="password" @focus="formValidClear()">
					<button class="btn btn-outline-primary" type="button" :disabled="loading" @click="resetPassword()">
						更改密碼
					</button>
		    </div>
				<div class="form-text text-danger">
		    	{{ formValidFeild('password') ? formValid.errors.password[0] : '&nbsp;' }}
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

<script setup>
import { ref } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache"
import formValidTools from '@/tools/composition/formValid'
import wrapValidator from '@/tools/validator'

const { formValid, formValidFeild, formValidClear } = formValidTools()

const store = useStore()
const router = useRouter()

const loading = ref(false)
const user = ref({
	email: "",
})
const formData = ref({
	name: "",
	phone: "",
	address: "",
})
const password = ref('')

axios.get('/user/profile').then(response => {
	user.value.email = response.data.email
	formData.value.name = response.data.name
	formData.value.phone = response.data.phone
	formData.value.address = response.data.address
})

function logout() {
	if (loading.value) return
	loading.value = true
	axios.post('/user/logout').then(response => {
		loading.value = false
		
		store.dispatch('userLogout')
		store.dispatch('showAlert', {
			type: 'success',
			text: response.data.msg
		})
		
		router.push('/')
	})
}

function save() {
	if (loading.value) return
	const validator = wrapValidator(formData.value, {
		name: 'string|max:32',
		phone: 'string|max:32',
		address: 'string|max:128',
	}, 'user');
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}
	loading.value = true
	axios.put('/user/profile', formData.value).then(response => {
		loading.value = false
		store.dispatch('showAlert', {
			type: 'success',
			text: response.data.msg
		})
	})
}

function resetPassword() {
	if (loading.value) return
	let resetPasswordFormData = { password: password.value }
	const validator = wrapValidator(resetPasswordFormData, {
		password: 'required|min:6|max:128',
	}, 'user');
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}
	axios.put('/user/profile/reset-password', resetPasswordFormData).then(response => {
		loading.value = false
		store.dispatch('showAlert', {
			type: 'success',
			text: response.data.msg
		})
	})
}
</script>

<script>
// import formValidTools from '@/tools/composition/formValid'
// import wrapValidator from '@/tools/validator'

// export default {
// 	setup() {
//     const { formValid, formValidFeild, formValidClear } = formValidTools();
    
//     return {
//       formValid,
//       formValidFeild,
//       formValidClear
//     }
//   },
//   data() {
//   	return {
//   		loading: false,
//   		user: {
//   			email: "",
//   		},
//   		formData: {
//         name: "",
// 				phone: "",
// 				address: "",
//         password: "",
//       },
//   	}
//   },
//   created() {
//   	this.axios.get('/user/profile').then(response => {
//   		this.user.email = response.data.email
//   		this.formData.name = response.data.name
// 			this.formData.phone = response.data.phone
// 			this.formData.address = response.data.address
//   	})
//   },
// 	methods: {
// 		logout() {
// 			if (this.loading) return
// 			this.loading = true
// 			this.axios.post('/user/logout').then(response => {
// 				this.loading = false
				
// 				this.$store.dispatch('userLogout')
// 				this.$store.dispatch('showAlert', {
// 					type: 'success',
//         	text: response.data.msg
// 				})
				
// 				this.$router.push('/')
// 			})
// 		},
// 		save() {
// 			if (this.loading) return
// 			const validator = wrapValidator(this.formData, {
// 				name: 'string|max:32',
// 				phone: 'required|string|max:32',
// 				address: 'string|max:128',
// 			}, 'user');
// 			if (validator.fail) {
// 				this.formValid = {
// 					fails: true,
// 					...validator.errors
// 				}
// 				console.log(this.formValid)
// 				console.log(this.formValidFeild('phone'))
// 				return
// 			}
// 			this.loading = true
// 			this.axios.put('/user/profile', this.formData).then(response => {
// 				this.loading = false
// 				this.$store.dispatch('showAlert', {
// 					type: 'success',
//         	text: response.data.msg
// 				})
// 			})
// 		}
// 	}
// }

</script>