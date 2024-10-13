<template>
	<div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-lg-10">
				<div class="row">
					<div class="col-md-6">
						<ImageUploader
							ref="imageUploaderRef"
							:feildName="'商品圖片'"
							:modelId="itemId"
							:parentLoading="loading"
							:parentModelName="'product'"
							@needNewItem="needNewItem"
						></ImageUploader>
						<div class="form-group mt-2">
							<label class="form-label">商品名稱</label>
							<input type="text" class="form-control" v-model="formData.name" @focus="formValidClear()" :disabled="loading" placeholder="請輸入商品名稱">
							<div class="form-text text-danger">
								{{ formValidFeild('name') ? formValid.errors.name[0] : '' }}
							</div>
						</div>
						<div class="form-group mt-2">
							<label class="form-label">售價</label>
							<input type="number" class="form-control" v-model="formData.price" @focus="formValidClear()" :disabled="loading">
							<div class="form-text text-danger">
								{{ formValidFeild('price') ? formValid.errors.price[0] : '' }}
							</div>
						</div>
						<div class="form-group mt-2 d-none">
							<label class="form-label">數量</label>
							<input type="number" class="form-control" v-model="formData.number" :disabled="loading">
						</div>
						<div class="form-group mt-2">
							<label class="form-label">條碼</label>
							<input type="text" class="form-control" v-model="formData.barcode" :disabled="loading">
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group mt-2">
							<label class="form-label">選項</label><br />
							<button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#productOptionsModal">
								設定商品選項
							</button>
							<div class="ms-3 mt-2" v-if="productOptions.length > 0">
								<div v-for="(item, key) in productOptions">
									<span class="fw-bold">{{ item.name }}</span>
									<div class="ms-2">
										<span v-for="(value, key) in item.values">
											{{ value }},
										</span>
									</div>
								</div>
								<router-link :to="baseUrl + itemId + '/variant'" @click="goVariant()" class="mt-2 btn btn-outline-secondary btn-sm">
									設定對應商品
									<i class="fa-solid fa-arrow-right"></i>
								</router-link>
							</div>
						</div>
						<div class="form-group mt-2">
							<label class="form-label">分類</label>
							<div class="d-flex align-items-center">
								<CategoryStatusRow
									v-model="categoryIds"
									:modelName="'product-category'"
								></CategoryStatusRow>
							</div>
						</div>
						<div class="form-group mt-2">
							<label class="form-label">描述</label>
							<textarea class="form-control" rows="5" v-model="formData.describe" :disabled="loading"></textarea>
						</div>
						<hr />
						<div class="form-group mt-2">
							<label class="form-label">狀態</label>
							<select class="form-select" v-model="formData.status" :disabled="loading" @change="isChangeStatus = true">
								<option selected :value="0">未上架</option>
								<option :value="1">上架</option>
							</select>
							<div class="form-text text-danger">
								{{ formValidFeild('status') ? formValid.errors.status[0] : '' }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row mt-3 justify-content-center">
			<div class="col-auto">
				<button class="btn btn-outline-success" @click="save" :disabled="loading">儲存</button>
			</div>
		</div>
	</div>
	<ProductOptionsModal
		ref="productOptionsModalRef"
		:productId="itemId"
		@needNewItem="needNewItem"
		@selectedOptions="selectedOptions"
		@hasDelVariantImage="hasDelVariantImage"
	></ProductOptionsModal>
</template>

<script setup>
import { onMounted, onActivated, ref  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";
import ImageUploader from "@/components/ImageUploader.vue";
import CategoryStatusRow from '@/components/category/StatusRow.vue';
import ProductOptionsModal from '@/components/modals/ProductOptionsModal.vue';
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

modelName.value = 'product'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'
itemId.value = route.params.productId

let originalCategoryIds = ''
const categoryIds = ref('')

const imageUploaderRef = ref(null)
const productOptionsModalRef = ref(null)
const productOptions = ref([])
const isChangeStatus = ref(false)

defineFormData({
	name: '',
	price: 0,
	number: 0,
	barcode: '',
	describe: '',
	status: 0,
})

onMounted(async () => {
	window.scrollTo(0, 0)
	if (route.params.productId !== undefined) {		
		loading.value = true
		Promise.all([
			getItem(),
			getProductsOnCategories()
		]).then((response) => {
			productOptions.value = response[0].data.options
			productOptionsModalRef.value.setParentOptions(productOptions.value)
		}).finally(() => {
			loading.value = false
		})
	}
})

onActivated(() => {
	isChangeStatus.value = false
	if (route.params.productId === undefined) {
		defineFormData({
			name: '',
			price: 0,
			number: 0,
			barcode: '',
			describe: '',
			status: 0,
		})
		emit('updateLayoutStatus', {
			title: '新增商品',
			showBack: true,
		})
		formMode.value = 'new'
		itemId.value = null
		productOptions.value = []
		productOptionsModalRef.value.setParentOptions(productOptions.value)
		categoryIds.value = ''
	} else {
		formMode.value = 'edit'
		emit('updateLayoutStatus', {
			title: '編輯商品',
			showBack: true,
		})
	}
})

async function needNewItem(callback, data) {
	let response = await saveItem()
	store.dispatch('showAlert', {
		type: 'success',
		text: '新增商品成功'
	})
	formMode.value = 'edit'
	itemId.value = String(response.data.id)
	setTimeout(() => {
		callback(data)
	}, 1);
}

function getProductsOnCategories() {
	return axios.get("/product/" + itemId.value + "/product-category").then((response) => {
		let ids = response.data.map(e => e.productCategoryId).join('-')
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
	addProductCategory(addIdsArr.join('-'))
	delProductCategory(delIdsArr.join('-'))
	
	if (isChangeStatus.value) {
		await axios.put('/product/' + itemId.value + '/product-category/update-number', {
			productCategoryIds: categoryIds.value
		}, {
			params: { storeId: storeId.value}
		})
	}
}

async function addProductCategory(productCategoryIds) {
	if (productCategoryIds === '') return
	return axios.post("/product/" + itemId.value + "/product-category", {
		productCategoryIds: productCategoryIds
	}, {
		params: { storeId: storeId.value}
	}).then((response) => {
	})
}

async function delProductCategory(productCategoryIds) {
	if (productCategoryIds === '') return
	return axios.delete("/product/" + itemId.value + "/product-category/", {
		params: {
			storeId: storeId.value,
			productCategoryIds: productCategoryIds
		}
	}).then((response) => {
	})
}

function selectedOptions(options) {
	productOptions.value = JSON.parse(JSON.stringify(options))
}

function hasDelVariantImage() {
	imageUploaderRef.value.getProductImages()
}

function goVariant() {
	let obj =  Object.assign({}, formData.value)
	obj.options = productOptions.value
	store.dispatch('setCache',{
		key: 'product_' + itemId.value,
		value: obj
	})
}

async function save() {
	if (loading.value) return
	// 轉數字
	formData.value.status = Number(formData.value.status)
	
	const validator = wrapValidator(formData.value, {
		name: 'string',
		price: 'required|numeric',
		number: 'numeric',
		barcode: 'string',
		describe: 'string',
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