<template>
  <div class="row mt-3 justify-content-md-center">
    <div class="col-12 col-lg-10">
      <h4>
        訂單編號: {{ itemId }}
      </h4>
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
        <div class="col-2 col-md-1 d-flex flex-row align-items-center">
          x{{ product.choiceNumber }}
        </div>
        <div class="col-2 d-flex flex-row align-items-center">
          ${{ getPrice(product) }}
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
      <div class="row my-2" v-if="order.status !== 0">
        <div class="col-12 col-md-6">
          <label class="form-label fw-bold fs-sm">付款方式</label>
          <div class="ms-2 mb-2">
            {{ getPayment(order.payment, 'name') }}
          </div>
          <div>
            <label class="form-label fw-bold fs-sm">聯絡資訊</label>
          </div>
          <div class="ps-2" v-if="order.payerInfo">
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
          <div class="d-flex justify-content-between">
            <label class="form-label fw-bold fs-sm">收件資訊</label>
          </div>
          <div class="ps-2" v-if="order.recipientInfo">
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
        <br />
      </div>
      <div class="row my-2">
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
        <div class="col-12 col-md-6" v-if="order.status !== 0">
          <div class="form-group">
            <label class="form-label">變更付款狀態</label>
            <select class="form-select" v-model="formData.paymentStatus" :disabled="loading">
              <option value="0">未付款</option>
              <option value="1">已付款</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">變更訂單狀態</label>
            <select class="form-select" v-model="formData.status" :disabled="loading">
              <option v-for="(item, key) in mapStatus" :value="item.value">{{ item.text }}</option>
            </select>
            <div class="form-text text-danger">
              {{ formValidFeild('status') ? formValid.errors.status[0] : '' }}
            </div>
          </div>
          <div class="form-group mt-2">
            <label class="form-label">訂單留言</label>
            <div v-if="order.userId === -1" class="text-secondary fst-italic">對方未登入下單，無法在此留言。</div>
            <textarea v-else class="form-control" rows="3" v-model="formData.comment" :disabled="loading"></textarea>
          </div>
        </div>
      </div>
      <div class="row mt-3 justify-content-center">
        <div class="col-auto">
          <button class="btn btn-outline-success" @click="save" :disabled="loading">儲存送出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onActivated, ref, reactive, watch  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate  } from "vue-router";
import { axios } from "@/tools/requestCache"
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";
import { mapStatus, getMapStatus } from "@/tools/composition/order"
import storeTools from "@/tools/composition/store"

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { loading, baseUrl, storeId, itemId,
	modelName, formMode, formData, defineFormData,
	formValid, formValidFeild, formValidClear,
	getItem, saveItem } = CRUDTools()

const {payment, shippingMethod, getStore, getPayment,
  getShippingMethod } = storeTools()

modelName.value = 'order'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'
itemId.value = route.params.orderId

const order = ref({ logs: [], content: [] })
const orderLogs = ref([])

defineFormData({
	status: 0,
  paymentStatus: 0,
  comment: '',
})

onMounted(async () => {
	window.scrollTo(0, 0)
	if (route.params.orderId !== undefined) {		
		loading.value = true
    axios.get('/order/' + route.params.orderId, {
      params: {
        storeId: storeId.value
      }
    }).then((response) => {
      order.value = response.data
      formData.value.status = order.value.status
      formData.value.paymentStatus = order.value.paymentStatus
      formData.value.comment = order.value.comment
      getStore(order.value.storeId).finally(() => {
        loading.value = false
      })
    })
	}
})

onActivated(() => {
	if (route.params.orderId === undefined) {
		defineFormData({
    	status: 0,
      paymentStatus: 0,
      comment: '',
    })
		emit('updateLayoutStatus', {
			title: '替會員新增訂單',
			showBack: true,
		})
		formMode.value = 'new'
		itemId.value = null
	} else {
		formMode.value = 'edit'
    formData.comment = ''
		emit('updateLayoutStatus', {
			title: '編輯訂單',
			showBack: true,
		})
	}
})

async function save() {
  if (loading.value) return
	// 轉數字
	formData.value.status = Number(formData.value.status)
	
	const validator = wrapValidator(formData.value, {
		status: 'required|enum:status',
	}, 'order');
	
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}

  if (formData.comment === '') delete formData.comment
	
	let response = await saveItem()
	
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
		goBack()
	}
}

function goBack() {
	if (router.options.history.state.back.startsWith('/login?redirect')) {
		router.push('/manage/store/' + route.params.storeId + '/order')
	} else {
		router.go(-1)
	}
}

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

// function getShipping(method) {
//   if (method === 1) {
//     return '超商取貨'
//   } else if (method === 2) {
//     return '宅配'
//   } else if (method === 3) {
//     return '到店取貨'
//   }
// }

// function getPayment(method) {
//   if (method === 1) {
//     return '信用卡'
//   } else if (method === 2) {
//     return '匯款'
//   } else if (method === 3) {
//     return '到貨付款'
//   }
// }

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