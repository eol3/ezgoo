<template>
  <div class="container">
    <div class="row justify-content-md-center py-3">
			<div class="col-12 col-md-5">
        <div class="row-image-wrap d-flex align-items-center mb-1" ref="rowImageWrap">
          <div class="product-no-image d-flex align-items-center justify-content-center bg-gray-200 mx-1 mb-2" v-if="productImages.length === 0">
            <i>尚無圖片</i>
          </div>
          <div v-for="(item, key) in productImages" :key="key">
            <div>
              <LoadingSpin
                v-if="item.loading === true"
                :width="320"
                :height="320"
                :borderRadius="'2%'"
              ></LoadingSpin>
              <div class="image-item d-flex align-items-center" v-else>
                <img :src="item.baseUrl + item.path + '/' + item.filename"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-5">
        <div class="mt-4">
          <p v-if="product.name === ''" class="card-text text-secondary fst-italic">尚無內容</p>
          <h4 v-else class="fw-bold">{{ product.name }}</h4>
        </div>
        <div>
          <span class="fs-5 text-primary">
            ${{ selectedProductVariant ? selectedProductVariant.price : product.price }}
          </span>
          <!-- <span class="ms-2 fw-light fst-italic text-decoration-line-through">$10</span> -->
        </div>
        <div class="my-2">
          <div v-for="(pItem, pKey) in product.options" :key="pKey" class="mb-1">
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
        </div>
        <div class="d-flex mt-3">
          <div class="product-number-group input-group me-2">
            <button class="btn btn-outline-secondary" @click="minus()">
              <i class="fa-solid fa-minus"></i>
            </button>
            <input type="number" class="form-control" v-model="choiceNumber">
            <button class="btn btn-outline-secondary" @click="choiceNumber += 1">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <button class="btn btn-outline-primary btn-sm" @click="addCart()">加入購物車</button>
        </div>
      </div>
    </div>
    <div class="row justify-content-between py-3 border" v-if="storeInfo">
			<div class="col-12 col-md-6 offset-md-1 mb-3 mb-md-0">
        <router-link :to="'/store/' + storeInfo.id" class="text-black text-decoration-none">
			  <div class="d-flex flex-row">
			    <div class="mx-2 my-auto">
    			  <img
              v-if="storeInfo.thumbnail"
              :src="storeInfo.thumbnail"
              class="rounded-circle avatar-image"
              width="60"
            />
            <div v-else class="no-image d-flex align-items-center justify-content-center bg-gray-200">
              <i style="font-size: 12px;" v-if="storeInfo.thumbnail !== undefined">尚無圖片</i>
            </div>
          </div>
          <div class="my-auto">
            <div class="fs-5 fw-bold" style="word-wrap: break-word;">
              {{ storeInfo.name }}
            </div>
          </div>
        </div>
        </router-link>
			</div>
			<div class="col-12 col-md-4 my-auto">
			  <div class="d-flex flex-row">
			    <button class="btn btn-outline-primary me-2 mobile-width-100">追蹤</button>
			    <button class="btn btn-outline-success mobile-width-100" @click="router.push('/manage/store/' + storeInfo.id)">管理後台</button>
			  </div>
			</div>
		</div>
    <div class="row justify-content-between py-3 border" v-else>
      <div class="col-12 col-md-6 offset-md-1 mb-3 mb-md-0">
        <div class="d-flex flex-row">
			    <div class="mx-2 my-auto">
            <div class="no-image d-flex align-items-center justify-content-center bg-gray-200">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row justify-content-md-center py-3">
      <div class="col-12 col-md-10" v-if="product.describe !== ''">
        <h5 class="mt-2 fw-bold">商品描述</h5>
        {{ product.describe }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import { axios } from "@/tools/requestCache";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import LoadingSpin from "@/components/LoadingSpin.vue";
import { setCart } from '@/tools/libs'

const store = useStore()
const route = useRoute()
const router = useRouter()

const storeInfo = ref(null)
const product = ref({
  name: '',
  price: 0,
  options: []
})
const proudctVariant = ref([])
const selectedProductVariant = ref(false)
const choiceNumber = ref(1)
const selectedOptions = ref([null, null, null]) // ['red', 'xl']
const queryObj = reactive({
  status: '1'
})
const productImages = ref([{ loading: true }])
const rowImageWrap = ref(null)

if (route.query.storeId) {
  queryObj.storeId = route.query.storeId
}

if (store.state.preview) {
  delete queryObj.status
}

onMounted( async () => {
  window.scrollTo(0, 0)
  getProduct()
  storeInfo.value = await store.dispatch('getCache', 'currentStore')
})

function getProduct() {
  axios.get('/product/' + route.params.productId, {
    params: queryObj
  }).then((response) => {
    queryObj.storeId = response.data.storeId
    product.value = response.data
    product.value.options = product.value.options === null ? [] : JSON.parse(product.value.options)
    getStore()
    getProductVariant()
    getProductImages()
  })
}

function getStore() {
  if (storeInfo.value) return
  axios.get('/store/' + queryObj.storeId, {
    params: queryObj
  }).then((response) => {
    storeInfo.value = response.data
  })
}

function getProductVariant() {
  axios.get('/product/' + route.params.productId + '/variant', {
    params: queryObj
  }).then((response) => {
    proudctVariant.value = response.data
    proudctVariant.value.forEach(e =>
      e.productOption = e.productOption ? JSON.parse(e.productOption) : []
    )
  })
}

function getProductImages() {
  axios.get('/product/' + route.params.productId + '/images', {
    params: queryObj
  }).then((response) => {
    productImages.value = response.data
    productImages.value.forEach(e =>
      e.productOption = e.productOption ? JSON.parse(e.productOption) : []
    )
  })
}

function minus() {
  choiceNumber.value -= 1
  if (choiceNumber.value < 1) choiceNumber.value = 1
}

function clickOption(pKye, item) {
  if (selectedOptions.value[pKye] === item) {
    selectedOptions.value[pKye] = null
  } else {
    selectedOptions.value[pKye] = item
  }
  const found = proudctVariant.value.find(e => isSame(e.productOption, selectedOptions.value))
  if (found) {
    selectedProductVariant.value = {
      id: found.id,
      price: found.price,
    }
  } else {
    selectedProductVariant.value = false
  }
  const foundKey = productImages.value.findIndex(e => isSame(e.productOption, selectedOptions.value))
  if (foundKey > -1) {
    rowImageWrap.value.scrollLeft = 330 * foundKey
  }
}

function isSame(array1, array2) {
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

function addCart() {
  if (store.state.preview) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '預覽模式無法新增至購物車'
    })
    return
  }
  if (storeInfo.value.status === 2) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '商店僅展示無法下單'
    })
    return
  }
  product.value.selectedOptions = selectedOptions.value
  product.value.variant = selectedProductVariant.value
  product.value.choiceNumber = choiceNumber.value
  setCart(storeInfo.value, product.value);
  store.dispatch('showAlert', {
    type: 'success',
    text: '成功加入購物車'
  })
}
</script>

<style lang="scss" scoped>

.product-no-image {
  width: 320px;
  height: 320px;
  border-radius: 2%;
	background-color: var(--d-gray-200);
	color: $gray-600;
}

.row-image-wrap {
	width: 100%;
	overflow-x: auto;
}

.image-item {
	width: 320px;
  height: 320px;
	overflow: hidden;
  margin: 0px 5px;
}

.image-item img {
	width: 100%;
}

.product-number-group {
  width: 140px
}

.product-number-group > input {
  text-align: center;
  border-color: var(--d-gray-600);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

input[type=number] {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}

</style>