<template>
  <div class="form-group">
    <label class="form-label">{{ feildName }}</label>
    <div class="row-image-wrap d-flex align-items-center mb-1" ref="rowImageWrap">
      <div class="no-image d-flex align-items-center justify-content-center bg-gray-200 mx-1 mb-2" v-if="list.length === 0">
        <i>尚無圖片</i>
      </div>
      <div v-for="(item, key) in list" :key="key">
        <div class="mx-1 mb-2">
          <LoadingSpin v-if="item.loading === true"></LoadingSpin>
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
          <div class="p-2 flex-fill d-flex justify-content-center cursor-pointer" @click="deleteImage(key, item)">
            <i class="fa-regular fa-trash-can"></i>
          </div>
          <div class="p-2 flex-fill d-flex justify-content-center cursor-pointer" @click="moveRight(key)">
            <i class="fa-solid fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
    <input
			type="file"
			class="form-control"
			name="productImages"
			multiple="multiple"
			accept="image/png, image/jpeg, image/gif, image/webp"
			@focus="formValidClear()"
			:disabled="parentLoading || uploading"
			@change="selectedFile"
			ref="fileupload"
		>
    <div class="form-text text-danger">
      {{ formValidFeild('images') ? formValid.errors.images[0] : '' }}
    </div>
  </div>
</template>

<script setup>
import { onActivated, ref, nextTick  } from 'vue'
import { useRoute } from "vue-router";
import LoadingSpin from "@/components/LoadingSpin.vue";
import { axios } from "@/tools/requestCache";
import CRUDTools from "@/tools/composition/CRUD";

const props = defineProps({
	modelId: {
		type: String,
		default: ''
	},
  feildName: {
		type: String,
		default: ''
	},
  parentLoading: {
    type: Boolean,
    default: false
  },
	parentModelName: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['needNewItem'])
defineExpose({ getProductImages })

const route = useRoute()

const { storeId, apiBaseUrl, itemId,
	modelName, queryObj, list, getList, deleteItem,
	formValid, formValidFeild, formValidClear } = CRUDTools()

modelName.value = 'images'
apiBaseUrl.value = '/' + props.parentModelName + '/' + props.modelId
storeId.value = route.params.storeId
queryObj.status = 'all'

const fileupload = ref(null)
const rowImageWrap = ref(null)
const uploading = ref(null)
// const productImages = ref([{loading: true}])
let isNeedUpdateProductThumbnail = false

// onMounted(async () => {
//   if (props.modelId) {
// 		list.value = [{loading: true}]
//     getList(queryObj)
//   }
// })

onActivated(async () => {
	if (route.params.productId !== undefined || route.params.postId !== undefined) {
		list.value = [{loading: true}]
    getList(queryObj)
  } else {
  	fileupload.value.value = null
		list.value = []
  }
})

async function selectedFile(e) {
	uploading.value = true
  if (!props.modelId) {
		emit('needNewItem', prepareFile, e)
    return
  }
	prepareFile(e)
}

async function prepareFile(e) {	
	apiBaseUrl.value = '/' + props.parentModelName + '/' + props.modelId
	var files = e.target.files || e.dataTransfer.files;
  if (!files.length || files.length === 0)
    return;
	
	let estimate = list.value.length + files.length
	if (estimate > 50) {
		formValid.value = {
			fails: true,
			errors: { productImages: [ '商品圖片數量不能超過50個' ] }
		}
		return
	}

	completeNum = 0
	totalUpload = files.length
	for (const file of files) {
		const formData = new FormData();
		formData.append('storeId', storeId.value)
    formData.append('files', file)
		if (list.value.length === 0) isNeedUpdateProductThumbnail = true
		list.value.push({ loading: true })
		await uploadImage(formData)
  }
	
	uploading.value = false
	fileupload.value.value = null
}

let totalUpload = 0
let completeNum = 0
const queue = []

async function uploadImage(formData) {
	while(queue.length >= 5) {
		await new Promise(r => setTimeout(r, 500));
	}
	queue.push(true)
	nextTick().then(() => {
		rowImageWrap.value.scrollLeft += 10000;
	})
	
	axios.post(apiBaseUrl.value + '/' + modelName.value , formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		}
	}).then(async () => {
		queue.pop()
		completeNum += 1
		if (completeNum === totalUpload) {
			await getProductImages()
		}		
	}).catch((error) => {
		if (error && error.response && error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
		for (const key in list.value) {
			if (list.value[key].loading) {
				list.value.splice(key, 1)
			}
		}
	})
}

async function getProductImages() {
	try {
		let response = await getList(queryObj)
		if (isNeedUpdateProductThumbnail) {
			let thumbnailValue = null
			if (response.data.length !== 0) {
				thumbnailValue = response.data[0].path + '/' + response.data[0].filename
			}
			await axios.put("/" + props.parentModelName + "/" + props.modelId, {
				thumbnail: thumbnailValue
			}, {
				params: { storeId: storeId.value }
			})
			isNeedUpdateProductThumbnail = false
		}
		list.value = response.data
	} catch(error) {}
	
}

async function moveLeft(key) {
	if (uploading.value) return
	if (key === 0) return
	moveImagePriority(key, key - 1)
}

async function moveRight(key) {
	if (uploading.value) return
	if (key === list.value.length-1) return
	moveImagePriority(key, key + 1)
}

async function moveImagePriority(key, targetKey) {
	if (uploading.value) return
	if (key === 0 || targetKey === 0) {
		isNeedUpdateProductThumbnail = true
	}
	list.value[key].loading = true
	list.value[targetKey].loading = true
	uploading.value = true
	try {
		await Promise.all([
			axios.put(apiBaseUrl.value + "/images/" + list.value[key].id, {
				priority: list.value[targetKey].priority
			}, {
				params: { storeId: storeId.value }
			}),
			axios.put(apiBaseUrl.value + "/images/" + list.value[targetKey].id, {
				priority: list.value[key].priority
			}, {
				params: { storeId: storeId.value }
			})
		])
		await getProductImages()
	} catch(error) {
		for (const key in list.value) {
			if (list.value[key].loading) {
				list.value[key].loading = false
			}
		}
	}
	uploading.value = false
}

async function deleteImage(key, item) {
	if (uploading.value) return
	if (item.loading) return
	uploading.value = true
	item.loading = true
	try {
		itemId.value = item.id
		await deleteItem()
		// axios.delete(apiBaseUrl.value + "//" + item.id, {
		// 	params: { storeId: storeId.value }
		// })
		if (key === 0) {
			isNeedUpdateProductThumbnail = true
			await getProductImages()
		} else {
			for (let i in list.value) {
				if (list.value[i].id === item.id) {
					list.value.splice(i, 1)
				}
			}
		}
	} catch (e) {
		item.loading = false
	}
	uploading.value = false
}

</script>

<style lang="scss" scoped>

.no-image {
  width: 120px;
  height: 160px;
  border-radius: 5%;
	background-color: var(--d-gray-200);
	color: $gray-600;
}

.row-image-wrap {
	width: 100%;
	overflow-x: auto;
}

.image-item {
	width: 120px;
  height: 120px;
	overflow: hidden;
}

.image-item img {
	width: 100%;
}

</style>