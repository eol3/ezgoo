<template>
	<div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-md-auto">
				<div class="form-group">
			    <label class="form-label">商品圖片</label>
					<div class="row-image-wrap d-flex align-items-center mb-1" ref="rowImageWrap">
						<div class="no-image d-flex align-items-center justify-content-center mx-1 mb-2" v-if="!loading && productImages.length === 0">
							<i>尚無圖片</i>
						</div>
						<div v-for="(item, key) in productImages" :key="key">
							<div class="mx-1 mb-2">
								<loading-spin v-if="item.loading === true"></loading-spin>
								<div class="image-item d-flex align-items-center" v-else>
									<img :src="item.baseUrl + item.path + '/' + item.filename"/>
								</div>
							</div>
							<div v-if="item.loading" class="d-flex option-wrap mx-1 mb-2" style="width: 120px;height: 32px;">
							</div>
							<div v-else class="d-flex option-wrap mx-1 mb-2">
								<div class="p-2 flex-fill d-flex justify-content-center cursor-pointer" @click="moveLeft(key)">
									<i class="fa-solid fa-arrow-left"></i>
								</div>
								<div class="p-2 flex-fill d-flex justify-content-center cursor-pointer" @click="deleteImage(item)">
									<i class="fa-regular fa-trash-can"></i>
								</div>
								<div class="p-2 flex-fill d-flex justify-content-center cursor-pointer" @click="moveRight(key)">
									<i class="fa-solid fa-arrow-right"></i>
								</div>
							</div>
						</div>
					</div>
			    <input type="file" class="form-control" name="productImages" multiple="multiple" @focus="formValidClear()" :disabled="loading || uploading" @change="selectedFile" ref="fileupload">
					<div class="form-text text-danger">
			    	{{ formValidFeild('productImages') ? formValid.errors.productImages[0] : '' }}
			    </div>
			  </div>
				<div class="form-group">
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
				<div class="form-group mt-2">
			    <label class="form-label">數量</label>
			    <input type="number" class="form-control" v-model="formData.number">
			  </div>
			  <div class="form-group mt-2">
			    <label class="form-label">規格</label>
			    <input type="text" class="form-control">
			  </div>
			  <div class="form-group mt-2">
			    <label class="form-label">分類</label>
			    <input type="text" class="form-control">
			  </div>
			  <div class="form-group mt-2">
			    <label class="form-label">描述</label>
			    <textarea class="form-control" rows="3" v-model="formData.describe"></textarea>
			  </div>
			  <hr />
			  <div class="form-group mt-2">
			    <label class="form-label">狀態</label>
			    <select class="form-select" v-model="formData.status">
					  <option selected value="0">未上架</option>
					  <option value="1">上架</option>
					</select>
					<div class="form-text text-danger">
			    	{{ formValidFeild('status') ? formValid.errors.status[0] : '' }}
			    </div>
			  </div>
		  </div>
		</div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-md-auto">
				<button class="btn btn-outline-success" @click="save">儲存</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onActivated, ref, nextTick  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/request";
import LoadingSpin from "@/components/LoadingSpin.vue";
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { loading, baseUrl,
	modelName, formMode, formData, initFormData,
	formValid, formValidFeild, formValidClear,
	getItem, saveItem } = CRUDTools()

modelName.value = 'product'
baseUrl.value = '/manage/store/' + route.params.storeId + '/' + modelName.value + '/'

const cacheItemId = ref(false)
const fileupload = ref(null)
const rowImageWrap = ref(null)
const uploading = ref(null)
const productImages = ref([{loading: true}])

let productId = route.params.productId

onActivated(async () => {
	window.scrollTo(0, 0)
	if (productId === undefined) {
		initFormData({
			name: '',
			price: 0,
			number: 0,
			describe: '',
			status: 0,
		})
		emit('updateLayoutStatus', {
			title: '新增商品',
			showBack: true,
		})
		formMode.value = 'new'
		cacheItemId.value = false
		fileupload.value.value = null
		productImages.value = []
	} else {
		formMode.value = 'edit'
		emit('updateLayoutStatus', {
			title: '編輯商品',
			showBack: true,
		})
		
		if (cacheItemId.value !== route.params.productId) {
			cacheItemId.value = route.params.productId
			loading.value = true
			Promise.all([
				getItem(route.params.productId, { storeId: route.params.storeId }),
				getProductImages()
			]).then(() => {
				// productImages.value.push({ loading: true })
				loading.value = false
			})
		}
	}
})

async function selectedFile(e) {
	store.state.updateData = true
	uploading.value = true
	if (formMode.value === 'new') {
		let response = await saveItem(productId, { storeId: route.params.storeId })
		formMode.value = 'edit'
		productId = response.data.id
	}

  var files = e.target.files || e.dataTransfer.files;
  if (!files.length)
    return;
	
	let estimate = productImages.value.length + files.length
	if (estimate > 50) {
		formValid.value = {
			fails: true,
			errors: { productImages: [ '商品圖片數量不能超過50個' ] }
		}
		return
	}

	let formDataArr = []
	let i = 0
	for (const file of files) {
		const formData = new FormData();
		formData.append('storeId', route.params.storeId)
    formData.append('files', file)
		let priority = productImages.value.length + 1
		formData.append('priority', priority)
		productImages.value.push({ loading: true })
		formDataArr.push(formData)
		i++
		if ((i % 5) === 0) {
			await uploadImages(formDataArr)
			formDataArr = []
		} else if (i === files.length) {
			await uploadImages(formDataArr)
		}
  }
	uploading.value = false
	fileupload.value.value = null
}

async function uploadImages(formDataArr) {
	let multiRequest = []
	const multiHeader = {
		headers: {
			"Content-Type": "multipart/form-data",
		}
	}
	for(const formData of formDataArr) {
		multiRequest.push(
			axios.post("/product/" + productId + "/images" , formData, multiHeader)
		)
	}
	nextTick().then(() => {
		rowImageWrap.value.scrollLeft += 10000;
	})
	
	try {
		await Promise.all(multiRequest)
	} catch(error) {
		if (error && error.response && error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
	}
	await getProductImages()
}

async function getProductImages() {
	let response = await axios.get("/product/" + productId + "/images", {
		params: { storeId: route.params.storeId }
	})
	productImages.value = response.data
}

async function moveLeft(key) {
	if (uploading.value) return
	if (key === 0) return
	moveImagePriority(key, key - 1)
}

async function moveRight(key) {
	if (uploading.value) return
	if (key === productImages.value.length-1) return
	moveImagePriority(key, key + 1)
}

async function moveImagePriority(key, targetKey) {
	if (loading.value) return
	productImages.value[key].loading = true
	productImages.value[targetKey].loading = true
	loading.value = true
	try {
		await Promise.all([
			axios.put("/product/" + productId + "/images/" + productImages.value[key].id, {
				priority: productImages.value[targetKey].priority
			}, {
				params: { storeId: route.params.storeId }
			}),
			axios.put("/product/" + productId + "/images/" + productImages.value[targetKey].id, {
				priority: productImages.value[key].priority
			}, {
				params: { storeId: route.params.storeId }
			})
		])
		await getProductImages()
	} catch(error) {
	}
	loading.value = false
}

async function deleteImage(item) {
	if (item.loading) return
	item.loading = true
	await axios.delete("/product/" + productId + "/images/" + item.id, {
		params: { storeId: route.params.storeId }
	})
	// getProductImages()
	for (let i in productImages.value) {
		if (productImages.value[i].id === item.id) {
			productImages.value.splice(i, 1)
		}
	}
}

async function save() {
	if (loading.value) return
	cacheItemId.value = false
	// 轉數字
	formData.value.status = Number(formData.value.status)
	
	const validator = wrapValidator(formData.value, {
		name: 'string',
		price: 'required|numeric',
		number: 'numeric',
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

	let response = await saveItem(productId, { storeId: route.params.storeId })
  
	store.state.updateData = true

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

<style lang="scss" scoped>

.no-image {
  width: 120px;
  height: 160px;
  border-radius: 5%;
  background-color: $gray-200;
	color: $gray-600;
}

.row-image-wrap {
	width: 360px;
	overflow-x: auto;
}

.image-item-wrap {
	height: 160px;
}

.image-item {
	width: 120px;
  height: 120px;
}

.image-item img {
	width: 100%;
}

.option-wrap {
	background-color: $gray-300;
	border-radius: 5%;
}

[data-bs-theme="dark"] {
	.no-image {
		background-color: $gray-700;
	}
	.option-wrap {
		background-color: $gray-600;
	}
}
</style>