<template>
	<div class="container my-5 pt-4">
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
			    <input type="password" class="form-control" v-model="formData.password" @focus="formValidClear()" placeholder="長度至少6碼，其餘不限">
			    <div class="form-text text-danger">
			    	{{ formValidFeild('password') ? formValid.errors.password[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <button class="btn btn-primary" @click="login()">登入</button>
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
import { mergeCart, setHead } from "@/tools/libs"
import { checkIsLoging } from '@/tools/composition/user'

const { formValid, formValidFeild, formValidClear } = formValidTools();

const store = useStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formData = ref({
	email: "",
	password: "",
})

setHead({ title: '登入' })

checkIsLoging(loading, axios, store, router)

async function login() {
	if (loading.value) return
	const validator = wrapValidator(formData.value, {
		email: 'required|string|email|max:64',
		password: 'required|min:6|max:32',
	}, 'user');
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}
	loading.value = true
	axios.post('/user/login', formData.value).then(async (response) => {
		formValid.value = {
			fails: false
		}
		let localUser = { id: response.data.user.id }
		localStorage.setItem('user', JSON.stringify(localUser))
		store.commit('setLocalUser', localUser)
		await mergeCart()
		loading.value = false
		// store.commit('setUser', response.data.user)
		if (route.query.redirect) {
			router.push(decodeURI(route.query.redirect))
		} else {
			router.push('/')
		}
		store.dispatch('showAlert', {
			type: 'success',
			text: response.data.msg
		})
	}).catch(error => {
		loading.value = false
		if (error.response && error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
	});
}

</script>