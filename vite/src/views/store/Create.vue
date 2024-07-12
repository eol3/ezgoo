<template>
	<div class="container my-3">
		<div class="row">
			<div class="col-md-6 mx-auto">
				<div class="mb-3">
					<span class="h3">建立商店</span>
				</div>
				<div class="mb-1">
					<label class="col-form-label">商店名稱</label>
					<input type="text" class="form-control" v-model="formData.name" @focus="formValidClear()">
			    <div class="form-text text-danger">
			    	{{ formValidFeild('name') ? formValid.errors.name[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <button class="btn btn-primary" @click="create()">建立商店</button>
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
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formData = ref({
	name: "",
})

function create() {
	if (loading.value) return
	const validator = wrapValidator(formData.value, {
		name: 'required|string|max:64',
	}, 'store');
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}
	loading.value = true
	axios.post('/store', formData.value).then(response => {
		loading.value = false
		formValid.value = {
			fails: false
		}
		store.dispatch('showAlert', {
			type: 'success',
			text: response.data.msg
		})
		router.push('/store/' + response.data.store.id)
	}).catch(error => {
		if (error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
	}).finally(() => { loading.value = false })
}
</script>