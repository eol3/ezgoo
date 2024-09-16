<template>
  <div class="container">
    <div class="row justify-content-md-center py-3">
      <div class="col-lg-8 mx-auto">
        <div v-if="store.state.localUser" @click="goBack()" class="btn btn-link text-decoration-none">
          <div class="my-2">
            <i class="fa-solid fa-chevron-left"></i>
            返回訂單列表
          </div>
        </div>
        <div class="mb-2 border rounded">
          <div class="p-2 p-md-3">
            <div>
              <h4>訂單編號: {{ order.id }}</h4>
            </div>
            <div>
              <!-- 之後要做訂單流線圖 -->
            </div>
            <router-link v-if="order.storeInfo" :to="'/store/' + order.storeInfo.id" class="text-decoration-none">
              <div class="store-head d-flex flex-row p-1 p-md-2">
                <div class="mx-1 my-auto">
                  <img
                    v-if="order.storeInfo.thumbnail"
                    :src="order.storeInfo.thumbnail"
                    class="rounded-circle avatar-image-sm"
                  />
                  <div v-else class="no-image-sm d-flex align-items-center justify-content-center bg-gray-200">
                    <i style="font-size: 6px;" v-if="order.storeInfo.thumbnail !== undefined">尚無圖片</i>
                  </div>
                </div>
                <div class="my-auto">
                  <div class="fs-6 fw-bold" style="word-wrap: break-word;">
                    {{ order.storeInfo.name }}
                  </div>
                </div>
              </div>
            </router-link>
            <hr />
            <div class="row my-2" v-for="(product, key) in order.content" :key="key">
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
                  x{{ product.choiceNumber }}
                </div>
                <div class="product-number-group input-group input-group-sm me-2">
                  ${{ getPrice(product) }}
                </div>
              </div>
            </div>
            <hr />
            <template v-if="order.footerInfo">
              <div class="row my-2" v-if="order.footerInfo.subTotal">
                <div class="col-2 col-md-1 offset-6 offset-md-7">
                  小計
                </div>
                <div class="col-2">
                  {{ order.footerInfo.subTotal }}
                </div>
              </div>
              <div class="row my-2" v-if="order.footerInfo.shippingFee">
                <div class="col-2 col-md-1 offset-6 offset-md-7">
                  運費
                </div>
                <div class="col-2">
                  +{{ order.footerInfo.shippingFee }}
                </div>
              </div>
              <div class="row my-2" v-if="order.footerInfo.freeShipping">
                <div class="col-4 col-md-2 offset-4 offset-md-6 text-end">
                  <span class="badge text-bg-success">
                    此單免運費
                  </span>
                </div>
              </div>
              <div class="row my-2" v-if="order.footerInfo.total">
                <div class="col-2 col-md-1 offset-6 offset-md-7">
                  總計
                </div>
                <div class="col-2">
                  {{ order.footerInfo.total }}
                </div>
              </div>
            </template>
            <br />
            <div class="row my-2">
              <div class="col-12 col-md-6">
                <label class="form-label fw-bold fs-sm">付款方式</label>
                <div class="ms-2 mb-2">
                  {{ getPayment(order.payment, 'name') }}
                </div>
                <div class="my-1 p-2 bg-2 rounded-2" v-if="getPayment(order.payment, 'tip') !== ''">
                  {{ getPayment(order.payment, 'tip') }}
                </div>
                <div>
                  <label class="mt-2 fw-bold fs-sm">聯絡資訊</label>
                </div>
                <div class="ps-2" v-if="order.status !== 0 && order.payerInfo">
                  <div class="mb-2">
                    姓名: {{ order.payerInfo.name }}
                  </div>
                  <div class="mb-2">
                    電話: {{ order.payerInfo.tel }}
                  </div>
                  <div class="mb-2">
                    E-mail: {{ order.payerInfo.email }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-bold fs-sm">運送方式</label>
                <div class="ms-2 mb-2">
                  {{ getShippingMethod(order.shippingMethod, 'name') }}
                </div>
                <div class="my-1 p-2 bg-2 rounded-2" v-if="getShippingMethod(order.shippingMethod, 'tip') !== ''">
                  {{ getShippingMethod(order.shippingMethod, 'tip') }}
                </div>
                <div class="d-flex justify-content-between">
                  <label class="mt-2 fw-bold fs-sm">收件資訊</label>
                  <span></span>
                </div>
                <div class="ps-2" v-if="order.status !== 0 && order.recipientInfo">
                  <div class="mb-2" v-if="order.payerInfo.name !== order.recipientInfo.name">
                    姓名: {{ order.recipientInfo.name }}
                  </div>
                  <div class="mb-2" v-if="order.payerInfo.tel !== order.recipientInfo.tel">
                    電話: {{ order.recipientInfo.tel }}
                  </div>
                  <div class="mb-2" v-if="order.recipientInfo.address">
                    地址: {{ order.recipientInfo.address }}
                  </div>
                  <div class="mb-2" v-if="order.recipientInfo.supermarketStoreName">
                    超商/門市名稱: {{ order.recipientInfo.supermarketStoreName }}
                  </div>
                </div>
              </div>
            </div>
            <br />
            <div class="row my-2 justify-content-center">
              <div class="col-12 col-md-6" v-if="order.logs.length > 0">
                <label class="form-label">變更紀錄/留言</label>
                <div v-for="item of order.logs" class="ms-3 mb-3">
                  <div class=" fw-light fst-italic">
                    {{ item.to.isStore ? '商家' : '買家' }}
                  </div>
                  <div class="ps-2" v-if="item.from.status !== undefined && item.to.status !== undefined">
                    訂單狀態: {{ getMapStatus(item.from.status).text }} -> <span class="fw-bold">{{ getMapStatus(item.to.status).text }}</span>
                  </div>
                  <div class="ps-2" v-if="item.to.comment">
                    {{ item.to.comment }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label class="form-label">訂單狀態:</label>
                  {{ getMapStatus(order.status).text }}
                </div>
                <div class="form-group">
                  <label class="form-label">訂單留言</label>
                  <textarea class="form-control" rows="3" v-model="formData.comment" :disabled="loading"></textarea>
                </div>
              </div>
            </div>
            <div class="row mt-3 justify-content-center">
              <div class="col-auto">
                <template v-if="order.status === 1">
                  <div @click="cancelOrder()" class="btn btn-link text-decoration-none">
                    取消訂單
                  </div>
                </template>
                <button class="btn btn-outline-success" @click="save" :disabled="loading">儲存送出</button>
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
import { axios } from "@/tools/requestCache"
import { mapStatus, getMapStatus } from "@/tools/composition/order"
import storeTools from "@/tools/composition/store"
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";

const { loading, formValid, formValidFeild, formValidClear } = CRUDTools()
const { payment, shippingMethod, setting, getStore,
    getPayment, getShippingMethod } = storeTools()

const store = useStore()
const route = useRoute()
const router = useRouter()

const order = ref({
  status: -1,
  payment: 1,
  shippingMethod: 1,
  logs: [],
  content: []
})
const formData = ref({
  comment: null,
})

// const payment = ref(null)
// const shippingMethod = ref(null)

const payer = ref({
  name: '',
  tel: '',
  email: '',
})
const recipient = ref({
  name: '',
  tel: '',
  address: '',
  supermarketStoreName: '',
})
const isAnotherRecipient = ref(false)

onMounted(() => {
  loading.value = true
  axios.get('/order/' + route.params.orderId).then((response) => {
    order.value = response.data
    getStore(order.value.storeId).finally(() => {
      if (order.value.status === 0) {
        getFooterInfo()
      }
      loading.value = false
    })
  })
})

function save() {

  const validator = wrapValidator(formData.value, {
    comment: 'string',
  }, 'order');
    
  if (validator.fail) {
    formValid.value = {
      fails: true,
      ...validator.errors
    }
    return
  }
  
  if (loading.value) return
  loading.value = true

  axios.put('/order/' + route.params.orderId, formData.value).then((response) => {
    store.dispatch('showAlert', {
      type: 'success',
      text: '成功送出訂單'
    })
    router.push('/user/orders')
  }).catch(error => {
    if (error.response.status === 400) {
      formValid.value = {
        fails: true,
        errors: error.response.data.errors
      }
    }
  }).finally(() => loading.value = false)
}

function goBack() {
  let lastPath = router.options.history.state.back
  if (!lastPath || lastPath.startsWith('/login?redirect')) {
		router.push('/user/orders')
	} else {
		router.go(-1)
	}
}

function getFooterInfo() {
  let info = { subTotal: getSubTotal(order.value.content) }
  order.value.footerInfo = info
  let shippingFee = getShippingFee(shippingMethod.value, order.value.shippingMethod)
  if (shippingFee) {
    order.value.footerInfo.shippingFee = shippingFee
  }
  let freeShipping = getFreeShipping(setting.value, order.value.footerInfo)
  if (freeShipping) {
    delete order.value.footerInfo.shippingFee
    order.value.footerInfo.freeShipping = true
  }
  let total = getTotal(order.value.footerInfo)
  if (total) {
    order.value.footerInfo.total = total
  }
}

function getPrice(product) {
  let price = 0
  if (product.variant && product.variant.price) price = product.variant.price
  else price = product.price
  return price * product.choiceNumber
}

function getSubTotal(list) {
  let total = 0
  for (const product of list) {
    total += getPrice(product)
  }
  return total
}

function getShippingFee(shippingMethod, id) {
  let total = 0
  for (const item of shippingMethod) {
    if (item.enable && item.id === id) {
      total = item.fee
    }
  }
  if (total === 0) return false
  else return total
}

function getFreeShipping(setting, footerInfo) {
  if (!footerInfo.shippingFee) return false
  if (setting.untilAmountFreeShipping) {
    if (footerInfo.subTotal > setting.untilAmountFreeShipping) return true
    else return false
  } else return false
}

function getTotal(footerInfo) {
  let total = 0
  for (const i in footerInfo) {
    total += footerInfo[i]
  }
  if (total === 0) return false
  else return total
}

function cancelOrder() {
  store.commit('setModal', {
		show: true,
		text: "<p>確認取消訂單?</p>",
		confirmCallback: async () => {
			store.state.modal.loading = true
			await axios.put('/order/' + route.params.orderId, {
        status: -1,
      })
      store.state.modal.loading = false
			store.state.modal.show = false
			store.dispatch('showAlert', {
				type: 'success',
				text: '訂單已取消'
			})
      router.push('/user/orders')
		}
	})
}

</script>

<style lang="scss" scoped>
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
</style>