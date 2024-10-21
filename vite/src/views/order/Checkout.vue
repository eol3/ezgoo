<template>
  <div class="container">
    <div class="row justify-content-md-center py-3">
      <div class="col-lg-8 mx-auto">
        <div v-if="store.state.localUser" @click="router.push('/cart')" class="btn btn-link text-decoration-none">
          <div class="my-2">
            <i class="fa-solid fa-chevron-left"></i>
            返回購物車
          </div>
        </div>
        <div class="mb-2 border rounded">
          <div class="p-2 p-md-3">
            <div>
              <h4>結帳</h4>
            </div>
            <div>
              <!-- 之後要做訂單流線圖 -->
            </div>
            <router-link v-if="storeInfo" :to="'/store/' + storeInfo.id" class="text-decoration-none">
              <div class="store-head d-flex flex-row p-1 p-md-2">
                <div class="mx-1 my-auto">
                  <img
                    v-if="storeInfo.thumbnail"
                    :src="storeInfo.thumbnail"
                    class="rounded-circle avatar-image-sm"
                  />
                  <div v-else class="no-image-sm d-flex align-items-center justify-content-center bg-gray-200">
                    <i style="font-size: 6px;" v-if="storeInfo.thumbnail !== undefined">尚無圖片</i>
                  </div>
                </div>
                <div class="my-auto">
                  <div class="fs-6 fw-bold" style="word-wrap: break-word;">
                    {{ storeInfo.name }}
                  </div>
                </div>
              </div>
            </router-link>
            <div class="p-2 p-md-3">
              <div class="row my-2" v-for="(product, key) in content" :key="key">
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
                    <button class="btn btn-outline-secondary" v-if="product.choiceNumber === 1" @click="trash(key)">
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
              <template v-if="formData.footerInfo">
                <div class="row my-2" v-if="formData.footerInfo.subTotal">
                  <div class="col-2 col-md-1 offset-6 offset-md-7">
                    小計
                  </div>
                  <div class="col-2">
                    {{ formData.footerInfo.subTotal }}
                  </div>
                </div>
                <div class="row my-2" v-if="formData.footerInfo.shippingFee">
                  <div class="col-2 col-md-1 offset-6 offset-md-7">
                    運費
                  </div>
                  <div class="col-2">
                    +{{ formData.footerInfo.shippingFee }}
                  </div>
                </div>
                <div class="row my-2" v-if="formData.footerInfo.freeShipping">
                  <div class="col-4 col-md-2 offset-4 offset-md-6 text-end">
                    <span class="badge text-bg-success mb-1">
                      此單免運費
                    </span>
                  </div>
                </div>
                <div class="row my-2" v-if="formData.footerInfo.total">
                  <div class="col-2 col-md-1 offset-6 offset-md-7">
                    總計
                  </div>
                  <div class="col-2">
                    {{ formData.footerInfo.total }}
                  </div>
                </div>
              </template>
            </div>
            <br />
            <div class="row my-2">
              <div class="col-12 col-md-6">
                <div class="mb-3">
                  <label class="form-label fw-bold fs-sm">付款方式</label>
                  <select class="form-select mb-2" v-model="formData.payment" :disabled="loading">
                    <template v-for="item in payment">
                      <option v-if="item.enable" :value="item.id">{{ item.name }}</option>
                    </template>
                  </select>
                  <div class="my-1 p-2 bg-2 rounded-2" v-if="getPayment(formData.payment, 'tip') && getPayment(formData.payment, 'tip') !== ''">
                    {{ getPayment(formData.payment, 'tip') }}
                  </div>
                </div>
                <div class="mb-3">
                  <div>
                    <label class="mt-2 fw-bold fs-sm">聯絡資訊</label>
                  </div>
                  <label class="form-label">姓名</label>
                  <input type="text" class="form-control" v-model="formData.payerInfo.name" @focus="formValidClear()" :disabled="loading">
                  <div class="form-text text-danger">
                    {{ formValidFeild('payerInfo.name') ? formValid.errors['payerInfo.name'][0] : '' }}
                  </div>
                  <label class="form-label">電話</label>
                  <input type="text" class="form-control" v-model="formData.payerInfo.tel" @focus="formValidClear()" :disabled="loading">
                  <div class="form-text text-danger">
                    {{ formValidFeild('payerInfo.tel') ? formValid.errors['payerInfo.tel'][0] : '' }}
                  </div>
                  <label class="form-label">E-mail</label>
                  <input type="eamil" class="form-control" v-model="formData.payerInfo.email" @focus="formValidClear()" :disabled="loading">
                  <div class="form-text text-danger">
                    {{ formValidFeild('payerInfo.email') ? formValid.errors['payerInfo.email'][0] : '' }}
                  </div>
                </div>
                <div class="mb-3" v-if="!store.state.localUser">
                  <div class="btn btn-link ps-0 text-decoration-none" data-bs-toggle="modal" data-bs-target="#registerModal">
                    順便註冊EzGoo帳號?
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="mb-3">
                  <label class="form-label fw-bold fs-sm">運送方式</label>
                  <select class="form-select mb-2" v-model="formData.shippingMethod" :disabled="loading" @change="getFooterInfo()">
                    <template v-for="item in shippingMethod">
                      <option v-if="item.enable" :value="item.id">{{ item.name }}</option>
                    </template>
                  </select>
                  <div class="my-1 p-2 bg-2 rounded-2" v-if="getShippingMethod(formData.shippingMethod, 'tip') && getShippingMethod(formData.shippingMethod, 'tip') !== ''">
                    {{ getShippingMethod(formData.shippingMethod, 'tip') }}
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <label class="fw-bold fs-sm">收件資訊</label>
                    <span></span>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="isAnotherRecipient" id="flexCheckDefault">
                      <label class="form-check-label fs-sm" for="flexCheckDefault">
                        新增不同收件人?
                      </label>
                    </div>
                  </div>
                  <template v-if="isAnotherRecipient">
                    <label class="form-label">姓名</label>
                    <input type="text" class="form-control" v-model="formData.recipientInfo.name" @focus="formValidClear()" :disabled="loading">
                    <div class="form-text text-danger">
                      {{ formValidFeild('recipientInfo.name') ? formValid.errors['recipientInfo.name'][0] : '' }}
                    </div>
                    <label class="form-label">電話</label>
                    <input type="text" class="form-control" v-model="formData.recipientInfo.tel" @focus="formValidClear()" :disabled="loading">
                    <div class="form-text text-danger">
                      {{ formValidFeild('recipientInfo.tel') ? formValid.errors['recipientInfo.tel'][0] : '' }}
                    </div>
                  </template>
                  <template v-if="formData.shippingMethod == 1">
                    <label class="form-label">地址</label>
                    <input type="text" class="form-control" name="address" v-model="formData.recipientInfo.address" @focus="formValidClear()" :disabled="loading">
                    <div class="form-text text-danger">
                      {{ formValidFeild('recipientInfo.address') ? formValid.errors['recipientInfo.address'][0] : '' }}
                    </div>
                  </template>
                  <template v-if="formData.shippingMethod == 3">
                    <label class="form-label">超商/門市名稱</label>
                    <input type="text" class="form-control" v-model="formData.recipientInfo.supermarketStoreName" @focus="formValidClear()" :disabled="loading">
                    <div class="form-text text-danger">
                      {{ formValidFeild('recipientInfo.supermarketStoreName') ? formValid.errors['recipientInfo.supermarketStoreName'][0] : '' }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="row my-2 justify-content-center">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label class="form-label">訂單留言</label>
                  <textarea class="form-control" rows="3" v-model="formData.comment" :disabled="loading"></textarea>
                </div>
              </div>
            </div>
            <div class="row my-3 justify-content-center">
              <div class="col-12 col-md-6 text-center">
                <i class="fa-regular fa-square-check"></i>
                下單即代表，您已閱讀並同意
                <template v-if="!store.state.localUser">
                  易購網購物平台的
                  <router-link class="text-decoration-none" to="/page/terms-of-service">
                    服務條款
                  </router-link>
                  與
                  <router-link class="text-decoration-none" to="/page/privacy-policy">
                    隱私政策
                  </router-link>
                  與
                </template>
                <router-link class="text-decoration-none" :to="'/store/' + storeInfo.id + '/about'">
                  商家的資訊
                </router-link>
              </div>
            </div>
            <div class="row my-3 justify-content-center">
              <div class="col-12 col-md-6 text-center">
                <button class="btn btn-outline-success" @click="save" :disabled="loading">
                  儲存送出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <RegisterModal v-model:email="formData.payerInfo.email"></RegisterModal>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { syncToServer, getCartItemNumber } from '@/tools/libs'
import { axios } from "@/tools/requestCache"
import storeTools from "@/tools/composition/store"
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";
import RegisterModal from '@/components/modals/RegisterModal.vue';

const { loading, formValid, formValidFeild, formValidClear } = CRUDTools()
const { payment, shippingMethod, setting, getStore, storeInfo,
    getFirstEnablePaymentId, getPayment,
    getFirstEnableShippingMethodId, getShippingMethod } = storeTools()

const store = useStore()
const route = useRoute()
const router = useRouter()

const cart = ref([])
const content = ref([])
const formData = ref({
  content: [],
  payment: 1,
  payerInfo: {
    name: '',
    tel: '',
    email: '',
  },
  shippingMethod: 1,
  recipientInfo: {
    name: '',
    tel: '',
    address: '',
    supermarketStoreName: '',
  },
  comment: null,
  footerInfo: null,
})
const isAnotherRecipient = ref(false)

onMounted(() => {
  loading.value = true
  window.scrollTo(0, 0)
  setContent()

  getStore(route.query.storeId).then(() => {
    if (storeInfo.value.status === 2) {
      store.dispatch('showAlert', {
        type: 'success',
        text: '此商店僅展示，不能下單購買'
      })
      router.push('/cart')
    }
    if (!setting.value.allowOrderWithoutLogIn && !store.state.localUser) {
      store.dispatch('showAlert', {
        type: 'warning',
        text: '請先登入'
      })
      router.push('/login?redirect=' + encodeURI(route.fullPath))
    }
    formData.value.payment = getFirstEnablePaymentId()
    formData.value.shippingMethod = getFirstEnableShippingMethodId()
    getFooterInfo()
  }).catch(error => {
    
  }).finally(() => {
    loading.value = false
  })

  if (store.state.localUser) {
    axios.get('/user/profile').then(response => {
      formData.value.payerInfo.name = response.data.name
      formData.value.payerInfo.tel = response.data.phone
      formData.value.payerInfo.email = response.data.email
      formData.value.recipientInfo.address = response.data.address
    })
  }
  
})

function save() {
  let ruleObj = {}
  
  ruleObj = {
    payment: 'enum:payment',
    shippingMethod: 'enum:shippingMethod',
    'payerInfo.name': 'required|string',
    'payerInfo.tel': 'required|string',
    'payerInfo.email': 'required|email|string',
    comment: 'string',
  }
  
  if (formData.value.shippingMethod === 3) {
    ruleObj['recipientInfo.supermarketStoreName'] = 'required|string'
  } else if (formData.value.shippingMethod === 1) {
    ruleObj['recipientInfo.address'] = 'required|string'
  }

  if (isAnotherRecipient.value) {
    ruleObj['recipientInfo.name'] = 'required|string'
    ruleObj['recipientInfo.tel'] = 'required|string'
  } else {
    formData.value.recipientInfo.name = formData.value.payerInfo.name
    formData.value.recipientInfo.tel = formData.value.payerInfo.tel
  }

  const validator = wrapValidator(formData.value, ruleObj, 'order');
    
  if (validator.fail) {
    formValid.value = {
      fails: true,
      ...validator.errors
    }
    return
  }

  if (formData.value.shippingMethod !== 1) {
    delete formData.value.recipientInfo.address
  }
  if (formData.value.shippingMethod !== 3) {
    delete formData.value.recipientInfo.supermarketStoreName
  }

  formData.value.storeId = storeInfo.value.id
  formData.value.storeInfo = storeInfo.value
  formData.value.content = content.value

  loading.value = true
  axios.post('/order/checkout', formData.value).then(() => {
    deleteStoreInCart()
    store.commit('setCart', {
      number: 0
    })
    syncCart()
    if (store.state.localUser) {
      store.dispatch('showAlert', {
        type: 'success',
        text: '成功送出訂單'
      })
      router.push('/user/orders')
    } else {
      store.dispatch('showAlert', {
        type: 'success',
        text: '成功送出訂單，詳細訂單資訊將發送至您的E-mail'
      })
      router.push('/store/' + storeInfo.value.id)
    }
  }).catch(error => {
    if (error.response && error.response.status === 400) {
      formValid.value = {
        fails: true,
        errors: error.response.data.errors
      }
    } else if (error.response && error.response.status === 422) {
      if (error.response.data) {
        if (error.response.data.content) {
          content.value = error.response.data.content
          formData.value.content = content.value
          for (const item of cart.value) {
            if (item.store.id === Number(route.query.storeId)) {
              item.content = content.value
              break;
            }
          }
        } else if (error.response.data.footerInfo) {
          formData.value.footerInfo = error.response.data.footerInfo
        }
        store.dispatch('showAlert', {
          type: 'warning',
          text: '訂單資料有異動，請確認後再下單'
        })
      }
    } else {
      console.log(error)
    }
  }).finally(() => {
    loading.value = false
  })
}

function setContent() {
  let c = localStorage.getItem("cart")
  if (c) cart.value = JSON.parse(c)
  for (let item of cart.value) {
    if (item.store.id === Number(route.query.storeId)) {
      content.value = item.content
      break;
    }
  }
}

function minus(product) {
  product.choiceNumber -= 1
  if (product.choiceNumber < 1) product.choiceNumber = 1
  getFooterInfo()
  syncCart()
}

function plus(product) {
  product.choiceNumber += 1
  getFooterInfo()
  syncCart()
}

function trash(key) {
  store.commit('setModal', {
		show: true,
		text: "<p>確認刪除商品?</p>",
		confirmCallback: async () => {
			store.state.modal.loading = true
			content.value.splice(key, 1)
      if (content.value.length === 0) {
        deleteStoreInCart()
        store.dispatch('showAlert', {
          type: 'success',
          text: '已無商品，請回商店重新選購'
        })
        router.push('/store/' + route.query.storeId)
      } else {
        getFooterInfo()
        store.dispatch('showAlert', {
          type: 'success',
          text: '刪除成功'
        }) 
      }
      store.commit('setCart', {
        number: getCartItemNumber(cart.value)
      })
      await syncCart()
      store.state.modal.show = false
		}
	})
}

function deleteStoreInCart() {
  for (const i in cart.value) {
    if (cart.value[i].store.id === Number(route.query.storeId)) {
      cart.value.splice(i, 1)
    }
  }
}

async function syncCart() {
  localStorage.setItem("cart", JSON.stringify(cart.value))
  if (!store.state.localUser) return
  await syncToServer(cart.value)
}

function getFooterInfo() {
  let info = { subTotal: getSubTotal(content.value) }
  formData.value.footerInfo = info
  let shippingFee = getShippingFee(shippingMethod.value, formData.value.shippingMethod)
  if (shippingFee) {
    formData.value.footerInfo.shippingFee = shippingFee
  }
  let freeShipping = getFreeShipping(setting.value, formData.value.footerInfo)
  if (freeShipping) {
    delete formData.value.footerInfo.shippingFee
    formData.value.footerInfo.freeShipping = true
  }
  let total = getTotal(formData.value.footerInfo)
  if (total) {
    formData.value.footerInfo.total = total
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