<template>
	<div class="modal fade" id="registerModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">註冊</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
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
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="register()" :disabled="loading">
            註冊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { onMounted, ref, reactive } from 'vue';
import { useStore } from "vuex";
import { axios } from "@/tools/requestCache"
import { Modal } from 'bootstrap'
import formValidTools from '@/tools/composition/formValid'
import wrapValidator from '@/tools/validator'

const { formValid, formValidFeild, formValidClear } = formValidTools();

const store = useStore()

const email = defineModel('email')

const loading = ref(false)
const formData = ref({
	email: email,
	verifyCode: "",
	password: "",
})

let modal = reactive({})
onMounted(async () => {
  var modalEl = document.getElementById('registerModal')
  modal = new Modal(modalEl)
})

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
		store.dispatch('showAlert', {
			type: 'success',
			text: response.data.msg
		})
    modal.hide()
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