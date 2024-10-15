<template>
  <div class="bg-1">
    <div class="container">
      <div class="row justify-content-md-center py-3">
        <div class="col-12 col-lg-10 p-4 bg-0">
          <div class="row">
            <div class="col-12 col-md-6">
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
            <div class="col-12 col-md-6">
              <div class="mt-4">
                <p v-if="product.name === ''" class="card-text text-secondary fst-italic">尚無內容</p>
                <h4 v-else class="fw-bold">
                  <span v-if="product.status === 0" class="text-secondary fst-italic">(未上架)</span>
                  {{ product.name }}
                </h4>
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
          <br /><br />
          <div class="p-3 border rounded-2">
            <div class="row justify-content-between" v-if="storeInfo">
              <div class="col-12 col-md-6 offset-md-1">
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
              <div class="col-12 col-md-6 offset-md-1 mt-2">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <label for="inputPassword6" class="col-form-label">付款方式</label>
                  </div>
                  <div class="col-auto">
                    <div class="text-break">
                      {{ getPaymentText() }}
                    </div>
                  </div>
                </div>
                <div class="row align-items-center">
                  <div class="col-auto">
                    <label for="inputPassword6" class="col-form-label">運送方式</label>
                  </div>
                  <div class="col-auto">
                    <div class="text-break">
                      {{ getShippingText() }}
                    </div>
                  </div>
                </div>
                <div class="row align-items-center" v-if="storeInfo.setting.untilAmountFreeShipping">
                  <div class="col-auto py-2">
                    購物滿「{{ storeInfo.setting.untilAmountFreeShipping }}」免運費
                  </div>
                </div>
              </div>
            </div>
            <div class="row justify-content-between" v-else>
              <div class="col-12 col-md-6 offset-md-1 mb-3 mb-md-0">
                <div class="d-flex flex-row">
                  <div class="mx-2 my-auto">
                    <div class="no-image d-flex align-items-center justify-content-center bg-gray-200">
                    </div>
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
            <div class="col-12 col-md-10" v-if="product.barcode !== ''">
              <div class="mt-2">商品條碼:{{ product.barcode }}</div>
            </div>
          </div>
          <br /><br />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onActivated, ref, reactive, nextTick } from 'vue';
import { axios } from "@/tools/requestCache";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import LoadingSpin from "@/components/LoadingSpin.vue";
import { setCart } from '@/tools/libs'

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

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
  storeId: route.params.storeId
})
const productImages = ref([{ loading: true }])
const rowImageWrap = ref(null)

onMounted( async () => {
  window.scrollTo(0, 0)
  storeInfo.value = await store.dispatch('getCache', 'currentStore')
})

onActivated(() => {
  getProduct()
	emit('updateLayoutStatus', {
    title: '商品預覽',
    showBack: true,
  })
})

function getProduct() {
  axios.get('/product/' + route.params.productId, {
    params: queryObj
  }).then((response) => {
    queryObj.storeId = response.data.storeId
    product.value = response.data
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
  })
}

function getProductImages() {
  axios.get('/product/' + route.params.productId + '/images', {
    params: {
      storeId: route.params.storeId,
      status: 'all'
    }
  }).then((response) => {
    productImages.value = response.data
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
  store.dispatch('showAlert', {
    type: 'warning',
    text: '預覽頁面無法新增至購物車'
  })
  return
}

function getPaymentText() {
	let text = ''
	for (const item of storeInfo.value.payment) {
		if (item.enable) {
			text += item.name + ", "
		}
		
	}
	return text.slice(0, -2)
}

function getShippingText() {
	let text = ''
	for (const item of storeInfo.value.shippingMethod) {
		if (item.enable) {
			text += item.name + ", "
		}
		
	}
	return text.slice(0, -2)
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