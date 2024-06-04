<template>
  <div class="row mt-3 justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          <div v-for="(pItem, pKey) in productOptions" :key="pKey">
            <span class="fw-bold">{{ pItem.name }}</span>
            <div class="d-flex align-items-center">
              <button
                class="ms-1 btn btn-outline-secondary btn-sm"
                :class="{ active: selectedOptions.indexOf(item) > -1 }"
                v-for="(item, key) in pItem.values"
                :key="key"
                @click="clickOption(pKey, item)"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <div class="mt-4">
            <template v-if="isNoSelect()">
              尚未選擇選項
            </template>
            <template v-else>
              <span v-if="formMode === 'new'">
                <i class="fa-solid fa-plus"></i>新增
              </span>
              <span v-if="formMode === 'edit'">
                <i class="fa-fw fa-solid fa-pen"></i>編輯
              </span>
              選項對應商品
            </template>
          </div>
          <ImageUploader
            class="mt-2"
            ref="imageUploaderRef"
						:feildName="'商品圖片'"
						:modelId="productId"
						:parentLoading="loading"
						:parentModelName="'product'"
						:parentFormMode="formMode"
						:productOption="selectedOptions"
						@needNewItem="save()"
					></ImageUploader>
          <div class="form-group mt-2">
            <label class="form-label">售價</label>
            <input type="number" class="form-control" v-model="formData.price" @focus="formValidClear()" :disabled="isNoSelect() || loading">
            <div class="form-text text-danger">
              {{ formValidFeild('price') ? formValid.errors.price[0] : '' }}
            </div>
          </div>
          <div class="form-group mt-2">
            <label class="form-label">數量</label>
            <input type="number" class="form-control" v-model="formData.number" :disabled="isNoSelect() || loading">
          </div>
          <div class="mt-4 text-center">
    				<button class="btn btn-outline-success" @click="save" :disabled="isNoSelect() || loading">
    				  {{ formMode === 'new' ? '新增': '儲存' }}
    				</button>
    				<button class="ms-2 btn btn-outline-danger" @click="deleteItemInModal()" :disabled="isNoSelect() || loading || formMode === 'new'">刪除</button>
    			</div>
        </div>
      </div>
    </div>
  </div>
  <confirm-modal></confirm-modal>
</template>

<script setup>
import { onActivated, ref  } from 'vue'
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { axios } from "@/tools/requestCache";
import ImageUploader from "@/components/VariantImageUploader.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue"
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";

const emit = defineEmits(['updateLayoutStatus'])

const store = useStore()
const route = useRoute()

const { loading, baseUrl, apiBaseUrl, storeId, itemId,
	modelName, formMode, formData, defineFormData, setFormData,
	formValid, formValidFeild, formValidClear,
	queryObj, list, getList, deleteItem,
	getItem, saveItem } = CRUDTools()

apiBaseUrl.value = '/product/' + route.params.productId
modelName.value = 'variant'
storeId.value = route.params.storeId
queryObj.status = 'all'

defineFormData({
  productOption: '',
	price: 0,
	number: 0,
})

const productId = ref(route.params.productId)
const productName = ref('')
const productOptions = ref([])
const selectedOptions = ref([null, null, null]) // ['red', 'xl']
const imageUploaderRef = ref(null)

onActivated(async () => {
  emit('updateLayoutStatus', {
    title: '設定商品選項對應商品',
    showBack: true,
  })
  let storeProduct = await store.dispatch('getCache', 'product_' + productId.value)
  
  if (storeProduct) {
    productName.value = storeProduct.name
    productOptions.value = storeProduct.options
  } else {
    let response = await axios.get('/product/' + productId.value, {
      params: {
        storeId: route.params.storeId
      }
    })
    productName.value = response.data.name
    productOptions.value = response.data.options === null ? [] : JSON.parse(response.data.options)
  }
  
  if (productName.value !== '') {
    emit('updateLayoutStatus', {
      title: '設定商品"' + productName.value + '"選項對應商品',
      showBack: true,
    })
  }
  
  getProductVariant()
})

async function getProductVariant() {
  await getList(queryObj)
  list.value.forEach(e => e.productOption = JSON.parse(e.productOption))
}

function clickOption(pKye, item) {
  if (selectedOptions.value[pKye] === item) {
    selectedOptions.value[pKye] = null
  } else {
    selectedOptions.value[pKye] = item
  }
  
  const found = list.value.find(e => isSame(e.productOption, selectedOptions.value))
  if (found) {
    formMode.value = 'edit'
    itemId.value = found.id
    setFormData({
      price: found.price,
    	number: found.number,
    })
  } else {
    formMode.value = 'new'
    setFormData({
      price: 0,
      number: 0,
    })
  }
}

function isSame(array1, array2) {
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

function isNoSelect() {
	return isSame(selectedOptions.value, [null, null, null])
}

function needNewItem() {
  
}

async function save() {
  if (isNoSelect()) {
    store.dispatch('showAlert', {
  		type: 'warning',
  		text: '尚未選擇選項'
  	})
  	return
  }
  formData.value.productOption = selectedOptions.value

  let response = await saveItem()
  
  let msg = ''
	if (response.data && response.data.msg) {
		msg = response.data.msg
	} else if (formMode.value === 'new') {
		msg = '新增成功'
	} else if (formMode.value === 'edit') {
		msg = '修改成功'
	}
	
	if (formMode.value === 'new') {
	  formMode.value = 'edit'
	  itemId.value = response.data.id
  }
	
	store.dispatch('showAlert', {
		type: 'success',
		text: msg
	})
	
	getProductVariant()
}

function deleteItemInModal() {
  // console.log(imageUploaderRef.value.deleteAllImage)
  // imageUploaderRef.value.deleteAllImage()
  
	store.commit('setModal', {
		show: true,
		text: "<p>確認刪除?</p>",
		confirmCallback: async () => {
			store.state.modal.loading = true
			await deleteItem()
			await imageUploaderRef.value.getProductImages()
			await getProductVariant()
			store.state.modal.show = false
			formMode.value = 'new'
			setFormData({
        price: 0,
        number: 0,
      })
			store.dispatch('showAlert', {
				type: 'success',
				text: '刪除成功'
			})
		}
	})
}
</script>