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
              </div>
              <div class="my-2">
                <div v-for="(pItem, pKey) in product.options" :key="pKey" class="mb-1">
                  <span class="fw-bold">{{ pItem.name }}</span>
                  <div>
                    <button
                      class="mx-1 my-1 btn btn-outline-secondary btn-sm"
                      :class="{ active: selectedOptions.indexOf(item) > -1 }"
                      :disabled="!findOptionInVariant(pKey, item)"
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
                <button class="btn btn-outline-primary btn-sm" @click="doAddCart()">加入購物車</button>
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
              <div class="col-12 col-md-4 my-auto">
                <div class="d-flex flex-row">
                  <button v-if="userStore && userStore.roleGroup === 'manage'" class="btn btn-outline-success mobile-width-100" @click="router.push('/manage/store/' + storeInfo.id)">管理後台</button>
                </div>
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
            <div class="col-12 col-md-10" v-if="barcode.length > 0">
              <div class="mt-2">商品條碼：{{ barcode.join(', ') }}</div>
            </div>
            <div class="col-12 col-md-10">
              <PublishedDate
                :fieldText="'上架日期'"
                :publishedAt="product.publishedAt">
              </PublishedDate>
            </div>
          </div>
          <br /><br />
        </div>
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
import PublishedDate from "@/components/PublishedDate.vue";
import { compareArraysWithRules, checkStoreStateBeforeAddCart, addCart, setHead } from '@/tools/libs'

const store = useStore()
const route = useRoute()
const router = useRouter()

const storeInfo = ref(null)
const userStore = ref(null)
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
  status: '1',
  withImage: true,
  withVariant: true,
})
const productImages = ref([{ loading: true }])
const rowImageWrap = ref(null)
const barcode = ref([])

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
  userStore.value = await store.dispatch('getCache', 'currentUserStore')
})

function getProduct() {
  axios.get('/product/' + route.params.productId, {
    params: queryObj
  }).then((response) => {
    queryObj.storeId = response.data.storeId
    getStore()
    getUserStore()
    product.value = response.data
    setHead({
      title: product.value.name,
      image: product.value.thumbnail,
      url: document.URL
    })
    if (product.value.barcode !== '') barcode.value.push(product.value.barcode)
    proudctVariant.value = response.data.variant
    proudctVariant.value.forEach(element => {
      if (element.barcode !== '') barcode.value.push(element.barcode)
    });
    productImages.value = response.data.image
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

function getUserStore() {
  if (userStore.value) return
  if (store.state.localUser) {
    axios.get('/user/store/' + queryObj.storeId).then(response => {
      userStore.value = response.data
      store.dispatch('setCache', {
        key: 'currentUserStore',
        value: userStore.value
      })
    })
  }
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
    if (found.barcode !== '') {
      barcode.value = [found.barcode]
      selectedProductVariant.value.barcode = found.barcode
    }
  } else {
    selectedProductVariant.value = false
    barcode.value = []
    if (product.value.barcode !== '') barcode.value.push(product.value.barcode)
    proudctVariant.value.forEach(element => {
      if (element.barcode !== '') barcode.value.push(element.barcode)
    });
  }
  const foundKey = productImages.value.findIndex(e => isSame(e.productOption, selectedOptions.value))
  if (foundKey > -1) {
    rowImageWrap.value.scrollLeft = 330 * foundKey
    let item = productImages.value[foundKey]
    selectedProductVariant.value.thumbnail = item.baseUrl + item.path + '/' + item.filename
  }
}

function isSame(array1, array2) {
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

function doAddCart() {
  if (proudctVariant.value.length > 0 && !selectedProductVariant.value) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '尚無此選項商品。'
    })
    return
  }
  if (!checkStoreStateBeforeAddCart(storeInfo.value, store)) return
  addCart(storeInfo.value, product.value,
    selectedOptions.value, selectedProductVariant.value,
    choiceNumber.value, store)
}

function findOptionInVariant(pKey, findItem) {
  let check = false
  let compareArray = [null, null, null]
  compareArray[pKey] = findItem
  let rules = ["ignore", "ignore", "ignore"]
  rules[pKey] = 'exact'
  for (let i in selectedOptions.value) {
    if (selectedOptions.value[i] && !compareArray[i]) {
      compareArray[i] = selectedOptions.value[i]
      rules[i] = 'exact'
    }
  }

  for (const item of proudctVariant.value) {
    if (compareArraysWithRules(item.productOption, compareArray, rules)) {
      check = true
      break;
    }
  }
  return check
}

function getPaymentText() {
	let text = ''
	for (const item of storeInfo.value.payment) {
		text += item.name + ", "
	}
	return text.slice(0, -2)
}

function getShippingText() {
	let text = ''
	for (const item of storeInfo.value.shippingMethod) {
    if (item.fee > 0) {
      text += item.name + `(運費:$${item.fee})` + ", "
    } else {
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