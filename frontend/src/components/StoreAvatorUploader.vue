<template>
  <div class="form-group mt-2">
    <label class="form-label">商店大頭貼</label>
    <div class="row-image-wrap d-flex align-items-center mb-1" ref="rowImageWrap">
      <div class="mx-1 mb-2" v-if="loading">
        <div class="wrap">
          <div class="loader"></div>
        </div>
      </div>
      <div class="no-image d-flex align-items-center justify-content-center bg-gray-200 mx-1 mb-2" v-if="!avator && !loading">
        <i>尚無圖片</i>
      </div>
      <div class="mx-1 mb-2 d-flex align-items-center justify-content-center" v-if="avator && !loading">
        <img class="avator-wrap" :src="avator.baseUrl + avator.path + '/' + avator.filename"/>
        <div class="ms-2 del-image d-flex align-items-center justify-content-center" @click="delAvator()">
          <i class="fa-regular fa-trash-can"></i>
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
			:disabled="loading"
			@change="selectedFile"
			ref="fileupload"
		>
    <div class="form-text text-danger">
      {{ formValidFeild('images') ? formValid.errors.images[0] : '' }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref  } from 'vue'
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";
import CRUDTools from "@/tools/composition/CRUD";

const route = useRoute()

const { storeId, apiBaseUrl, modelName, itemId, queryObj, getList,
  deleteItem, loading,
  formValid, formValidFeild, formValidClear } = CRUDTools()

modelName.value = 'images'
storeId.value = route.params.storeId
apiBaseUrl.value = '/store/' + storeId.value
queryObj.status = 'all'
queryObj.type = '1'

const avator = ref(null)
const fileupload = ref(null)

onMounted(async () => {
  fileupload.value.value = null
  await getAvator()
})

async function getAvator() {
  loading.value = true
  let response = await getList(queryObj)
  avator.value = response.data[0]
  loading.value = false
}

async function selectedFile(e) {
  var files = e.target.files || e.dataTransfer.files;
  if (!files.length || files.length === 0)
    return;

  loading.value = true

  if (avator.value) {
    itemId.value = avator.value.id
    await deleteItem()
  }

  const formData = new FormData();
  formData.append('storeId', storeId.value)
  formData.append('type', 1)
  formData.append('files', files[0])
  
  axios.post(apiBaseUrl.value + '/' + modelName.value , formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		}
	}).then(async () => {
		await getAvator()
    await setStoreThumbnail()
	}).catch((error) => {
		if (error && error.response && error.response.status === 400) {
			formValid.value = {
				fails: true,
				errors: error.response.data.errors
			}
		}
	}).finally(() => {
    loading.value = false
    fileupload.value.value = null
  })
}

async function delAvator() {
  itemId.value = avator.value.id
  await deleteItem()
  await getAvator()
  await setStoreThumbnail()
}

async function setStoreThumbnail() {
  let thumbnailUrl = null
  if (avator.value) {
    thumbnailUrl = avator.value.path + '/' + avator.value.filename
  }
  axios.put(apiBaseUrl.value, {
    thumbnail: thumbnailUrl
  }, {
    params: { storeId: storeId.value }
  })
}
</script>

<style lang="scss" scoped>

.avator-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.del-image {
  cursor: pointer;
  width: 30px;
  height: 36px;
  background-color: var(--d-gray-200);
  border-radius: 10px;
}

.no-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
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


.wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding-top: 10px;
  padding-left: 10px;
  background-color: $gray-200;
}

[data-bs-theme="dark"] {
  .wrap {
    background-color: $gray-700;
  }
}

.loader {
  border: 6px solid #f3f3f3;
  border-radius: 50%;
  border-top: 6px solid #3498db;
  width: 60px;
  height: 60px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>