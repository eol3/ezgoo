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
				    <button class="btn btn-outline-primary" type="button" :disabled="loading" @click="getVerifyCode()">
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
			  <button class="btn btn-primary" :disabled="loading" @click="register()">註冊</button>
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
import { setHead } from "@/tools/libs"

const { formValid, formValidFeild, formValidClear } = formValidTools();

const store = useStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formData = ref({
	email: "",
	verifyCode: "",
	password: "",
})

setHead({ title: '註冊' })

function getVerifyCode() {
	if (loading.value) return
	const validator = wrapValidator(formData.value, {
		email: 'required|string|email|max:64',
	}, 'user');
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}
	loading.value = true
	axios.post('/user/send-email-code', {
		email: formData.value.email,
		register: true
	}).then(() => {
		store.dispatch('showAlert', {
			type: 'success',
			text: '成功發送驗證碼'
		})
	}).catch(error => {
		if (error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
	}).finally(() => {
		loading.value = false
	})
}

function register() {
	if (loading.value) return
	const validator = wrapValidator(formData.value, {
		email: 'required|string|email|max:64',
		verifyCode: 'required|numeric|length:6',
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
	axios.post('/user/register', formData.value).then(response => {
		formValid.value = {
			fails: false
		}
		let localUser = { id: response.data.user.id }
		localStorage.setItem('user', JSON.stringify(localUser))
		store.commit('setLocalUser', localUser)
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
		if (error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
	}).finally(() => {
		loading.value = false
	})
}

</script>