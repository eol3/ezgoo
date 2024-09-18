<template>
  <div class="container">
    <div class="row justify-content-md-center py-3">
      <div class="col-12 col-md-8">
        <h5>購物車</h5>
        <div class="text-center" style="height:300px;" v-if="cart.length === 0">
          <div class="mt-4">尚無商品</div>
        </div>
        <div v-for="(store, skey) in cart" :skey="skey" class="mb-2 border rounded">
          <router-link v-if="store.store" :to="'/store/' + store.store.id" class="text-black text-decoration-none">
            <div class="store-head d-flex flex-row p-2 p-md-3">
              <div class="mx-2 my-auto">
                <img
                  v-if="store.store.thumbnail"
                  :src="store.store.thumbnail"
                  class="rounded-circle avatar-image"
                  width="60"
                />
                <div v-else class="no-image d-flex align-items-center justify-content-center bg-gray-200">
                  <i style="font-size: 12px;" v-if="store.store.thumbnail !== undefined">尚無圖片</i>
                </div>
              </div>
              <div class="my-auto">
                <div class="fs-5 fw-bold" style="word-wrap: break-word;">
                  {{ store.store.name }}
                </div>
              </div>
            </div>
          </router-link>
          <div class="p-2 p-md-3">
            <div class="row my-2" v-for="(product, key) in store.content" :key="key">
              <div class="col-6 offset-md-1">
                <div class="product-row d-flex flex-row align-items-center">
                  <div>
                    <router-link :to="'/product/' + product.id">
                      <img :src="product.thumbnail ? product.thumbnail : 'https://placehold.co/200'" />
                    </router-link>
                  </div>
                  <div class="ms-2 d-flex flex-column">
                    <router-link :to="'/product/' + product.id" class="text-black text-decoration-none">
                      <div class="product-name-field">
                        {{ product.name }}
                      </div>
                    </router-link>
                    <span class="text-secondary">
                      {{ product.selectedOptions.filter(Boolean).join(',') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-5 d-flex flex-row align-items-center">
                <div class="me-2 price-field">
                  ${{ getPrice(product) }}
                </div>
                <div class="product-number-group input-group input-group-sm me-2">
                  <button class="btn btn-outline-secondary" v-if="product.choiceNumber === 1" @click="trash(skey, key)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                  <button class="btn btn-outline-secondary" v-else @click="minus(product)">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input type="number" class="form-control" v-model="product.choiceNumber">
                  <button class="btn btn-outline-secondary" @click="plus(product)">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
            <hr />
            <div class="row my-2">
              <div class="col-2 col-lg-1 offset-4 offset-md-5 offset-lg-6">
                小計
              </div>
              <div class="col-5">
                {{ getTotal(store.content) }}
              </div>
            </div>
            <div class="row my-2">
              <div class="col-6 col-md-5 offset-6 offset-md-7">
                <button class="btn btn-primary" @click="checkout(store.store)" :disabled="loading">
                  開始結帳
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { syncToServer, isSame, getCartItemNumber } from '@/tools/libs'
import { axios } from "@/tools/request"
import { setHead } from '@/tools/libs'

const store = useStore()
const route = useRoute()
const router = useRouter()

const cart = ref([])
const loading = ref(false)

onMounted( async () => {
  setHead({ title: '購物車' })
  let c = localStorage.getItem("cart")
  if (c) cart.value = JSON.parse(c)
})

function getPrice(product) {
  let price = 0
  if (product.variant && product.variant.price) price = product.variant.price
  else price = product.price
  return price * product.choiceNumber
}

function getTotal(list) {
  let total = 0
  for (const product of list) {
    total += getPrice(product)
  }
  return total
}

function minus(product) {
  product.choiceNumber -= 1
  if (product.choiceNumber < 1) product.choiceNumber = 1
  syncCart()
}

function plus(product) {
  product.choiceNumber += 1
  syncCart()
}

function trash(skey, key) {
  store.commit('setModal', {
		show: true,
		text: "<p>確認刪除商品?</p>",
		confirmCallback: async () => {
			store.state.modal.loading = true
			cart.value[skey].content.splice(key, 1)
      if (cart.value[skey].content.length === 0) {
        cart.value.splice(skey, 1)
      }
      store.commit('setCart', {
        number: getCartItemNumber(cart.value)
      })
      await syncCart()
			store.state.modal.show = false
			store.dispatch('showAlert', {
				type: 'success',
				text: '刪除成功'
			})
		}
	})
}

async function syncCart() {
  let cartStr = JSON.stringify(cart.value)
  localStorage.setItem("cart", cartStr)
  if (!store.state.localUser) return
  await syncToServer(cart.value)
}

async function checkout(storeShortInfo) {
  // console.log(await store.dispatch('getCache', 'currentStore'))
  loading.value = true
  axios.get('/store/' + storeShortInfo.id, {
    params: {
      status: '1',
    }
  }).then(response => {
    let storeInfo = response.data
    if (storeInfo.status === 2) {
      store.dispatch('showAlert', {
        type: 'success',
        text: '此商店僅展示，不能下單購買'
      })
      router.push('/cart')
    } else if (!storeInfo.setting.allowOrderWithoutLogIn && !store.state.localUser) {
      store.dispatch('showAlert', {
        type: 'warning',
        text: '請先登入'
      })
      router.push('/login?redirect=' + encodeURI(route.fullPath))
    } else {
      router.push('/order/checkout?storeId=' + storeShortInfo.id)
    }
    
  }).finally(() => loading.value = false)
  // loading.value = true
  // 預檢查
  // if (!await preCheck(storeItem)) {
  //   loading.value = false
  //   return
  // }

  // 建立訂單
  // let result = await order(storeItem)
  // if (!result) {
  //   store.dispatch('showAlert', {
  //     type: 'warning',
  //     text: '部分商品有異動，請確認後，再次結帳'
  //   })
  // } else {
  //   router.push('/order/' + result.data.id)
  // }
  // loading.value = false
}

async function order(storeItem) {
  let result = false
  try {
    result = await axios.post('/order',
      {
        storeInfo: storeItem.store,
        content: storeItem.content
      },
      { params: { storeId: storeItem.store.id }
    })
  } catch(error) {
    if (error.response.status === 400) {
      result = false
    }
  }
  return result
}

async function preCheck(storeItem) {
  let checkAllResult = true
  let result = {}
  for (const item of storeItem.content) {
    if (item.variant) {
      let resultVariant = await getProductVariant(storeItem.store.id, item.id, item.variant.id)
      if (!resultVariant) {
        item.id = -1
        checkAllResult = false
      } else {
        // 檢查變異商品，如先加了某個選項，之後商家在加了對應變異商品，會檢查不到，現在懶得用以後要補，感覺這個預檢查應該整個重新調整
        result = checkVariantPrice(item.variant, resultVariant.data)
        if (!result) checkAllResult = false
        result = checkVariantOptions(item.selectedOptions, resultVariant.data)
        if (!result) {
          item.id = -1
          checkAllResult = false
        }
      }
    } else {
      let resultProduct = await getProduct(storeItem.store.id, item.id)
      if (!resultProduct) {
        item.id = -1
        checkAllResult = false
      } else {
        result = checkProductPrice(item, resultProduct.data)
        if (!result) checkAllResult = false
      }
    }
  }
  storeItem.content = storeItem.content.filter(item => {
    return item.id !== -1
  })
  if (!checkAllResult) {
    syncCart()
    store.dispatch('showAlert', {
      type: 'warning',
      text: '部分商品有異動，請確認後，再次結帳'
    })
  }
  return checkAllResult
}

async function getProduct(storeId, id) {
  let result = false
  try {
    result = await axios.get('/product/' + id, {
      selfErrorHandle: true,
      params: {
        storeId: storeId,
        status: 1,
      }
    })
  } catch(error) {
    if (error.response.status === 400) {
      result = false
    }
  }
  return result
}

function checkProductPrice(oriProduct, product) {
  if (oriProduct.price === product.price) return true
  else {
    oriProduct.price = product.price
    return false
  }
}

async function getProductVariant(storeId, productId, id) {
  let result = false
  try {
    result = await axios.get('/product/' + productId + '/variant/' + id, {
      selfErrorHandle: true,
      params: {
        storeId: storeId,
        status: 1,
      }
    })
  } catch(error) {
    if (error.response.status === 400) {
      result = false
    }
  }
  return result
}

function checkVariantPrice(oriVariant, variant) {
  if (oriVariant.price === variant.price) return true
  else {
    oriVariant.price = variant.price
    return false
  }
}

function checkVariantOptions(selectedOptions, variant) {
  if (!variant.productOption) return false
  variant.productOption = JSON.parse(variant.productOption)
  if (isSame(selectedOptions, variant.productOption)) return true
  else return false
}

</script>

<style lang="scss" scoped>
.store-head {
  background-color: var(--d-gray-300);
}

.product-row {
  height: 60px;
}
.product-row img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.product-name-field {
  text-overflow: ellipsis;
  width: 180px;
  white-space: nowrap;
  overflow: hidden;
}

@media (max-width: 768px) {
	.product-name-field {
		width: 100px;
	}
}

.price-field {
  width: 60px;
}

.product-number-group {
  width: 100px
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