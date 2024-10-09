<template>
	<div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-lg-10">
				<div class="row">
					<div class="col-md-6">
						<ImageUploader
							ref="imageUploaderRef"
							:feildName="'貼文圖片'"
							:modelId="itemId"
							:parentLoading="loading"
							:parentModelName="'post'"
							@needNewItem="needNewItem"
						></ImageUploader>
						<div class="form-group mt-2">
							<label class="form-label">分類</label>
							<div class="d-flex align-items-center">
								<CategoryStatusRow
									v-model="categoryIds"
									:modelName="'post-category'"
								></CategoryStatusRow>
							</div>
						</div>
						<div class="form-group mt-2">
							<label class="form-label">貼文內容</label>
							<textarea class="form-control" rows="5" v-model="formData.content" :disabled="loading"></textarea>
						</div>
						<hr />
						<div class="form-group mt-2">
							<label class="form-label">狀態</label>
							<select class="form-select" v-model="formData.status" :disabled="loading">
								<option selected :value="0">未公開</option>
								<option :value="1">公開</option>
							</select>
							<div class="form-text text-danger">
								{{ formValidFeild('status') ? formValid.errors.status[0] : '' }}
							</div>
						</div>
						<div class="row mt-3 justify-content-center">
        			<div class="col-auto">
        				<button class="btn btn-outline-success" @click="save" :disabled="loading">儲存</button>
        			</div>
        		</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, onActivated, ref  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";
import ImageUploader from "@/components/ImageUploader.vue";
import CategoryStatusRow from '@/components/category/StatusRow.vue';
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { loading, baseUrl, storeId, itemId,
	modelName, formMode, formData, defineFormData,
	formValid, formValidFeild, formValidClear,
	getItem, saveItem } = CRUDTools()

modelName.value = 'post'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'
itemId.value = route.params.postId

let originalCategoryIds = ''
const categoryIds = ref('')

const imageUploaderRef = ref(null)

defineFormData({
	content: '',
	status: 0,
})

onMounted(async () => {
	window.scrollTo(0, 0)
	if (route.params.postId !== undefined) {		
		loading.value = true
		Promise.all([
			getItem(),
			getPostsOnCategories()
		]).then((response) => {
		}).finally(() => {
			loading.value = false
		})
	}
})

onActivated(() => {
	if (route.params.postId === undefined) {
		defineFormData({
    	content: '',
    	status: 0,
    })
		emit('updateLayoutStatus', {
			title: '新增貼文',
			showBack: true,
		})
		formMode.value = 'new'
		itemId.value = null
		categoryIds.value = ''
	} else {
		formMode.value = 'edit'
		emit('updateLayoutStatus', {
			title: '編輯貼文',
			showBack: true,
		})
	}
})

async function needNewItem(callback, data) {
	let response = await saveItem()
	store.dispatch('showAlert', {
		type: 'success',
		text: '新增貼文成功'
	})
	formMode.value = 'edit'
	itemId.value = String(response.data.id)
	setTimeout(() => {
		callback(data)
	}, 1);
}

function getPostsOnCategories() {
	return axios.get("/post/" + itemId.value + "/post-category").then((response) => {
		let ids = response.data.map(e => e.postCategoryId).join('-')
		originalCategoryIds = ids
		categoryIds.value = ids
	})
}

async function compareCagegory() {
	let oldIdsArr = originalCategoryIds.split('-')
	let newIdsArr = categoryIds.value.split('-')
	let addIdsArr = [], delIdsArr = []
	for (let i in oldIdsArr) {
		for (let j in newIdsArr) {
			if (oldIdsArr[i] === newIdsArr[j]) {
				oldIdsArr[i] = -1
				newIdsArr[j] = -1
			}
		}
	}
	for (let i in newIdsArr) {
		if (newIdsArr[i] !== -1) addIdsArr.push(newIdsArr[i])
	}
	for (let i in oldIdsArr) {
		if (oldIdsArr[i] !== -1) delIdsArr.push(oldIdsArr[i])
	}
	addPostCategory(addIdsArr.join('-'))
	delPostCategory(delIdsArr.join('-'))
}

async function addPostCategory(postCategoryIds) {
	if (postCategoryIds === '') return
	return axios.post("/post/" + itemId.value + "/post-category", {
		postCategoryIds: postCategoryIds
	}, {
		params: { storeId: storeId.value}
	}).then((response) => {
	})
}

async function delPostCategory(postCategoryIds) {
	if (postCategoryIds === '') return
	return axios.delete("/post/" + itemId.value + "/post-category/", {
		params: {
			storeId: storeId.value,
			postCategoryIds: postCategoryIds
		}
	}).then((response) => {
	})
}

async function save() {
	if (loading.value) return
	// 轉數字
	formData.value.status = Number(formData.value.status)
	
	const validator = wrapValidator(formData.value, {
		content: 'string',
		status: 'required|enum:status',
	}, 'product');
	
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}
	
	let response = await saveItem()
	if (formMode.value === 'new') {
		itemId.value = String(response.data.id)
	}
	await compareCagegory()
	originalCategoryIds = categoryIds.value
	
	let msg = ''
	if (response.data.msg) {
		msg = response.data.msg
	} else if (formMode.value === 'new') {
		msg = '新增成功'
	} else if (formMode.value === 'edit') {
		msg = '修改成功'
	}

	store.dispatch('showAlert', {
		type: 'success',
		text: msg
	})

	if (formMode.value === 'new') {
		router.push(baseUrl.value)
		window.scrollTo(0, 0)
	} else if (formMode.value === 'edit') {
		router.go(-1)
	}
}

</script>
