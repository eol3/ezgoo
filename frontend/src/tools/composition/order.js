import { ref, reactive } from 'vue';
import { axios } from "@/tools/requestCache";

export function storePSFunc() {
  const payment = ref([])
  const shippingMethod = ref([])

  async function getStorePS(storeId) {
    let response = {}
    try {
      response = await axios.get("/store/" + storeId)
      payment.value = response.data.payment
      shippingMethod.value = response.data.shippingMethod
      return response
    } catch(error) {
      console.log(error)
      throw error;
    }
  }

  function getFirstEnablePaymentId() {
    let result = payment.value.find(e => e.enable)
    if (result) return result.id
    else return false
  }

  function getFirstEnableShippingMethodId() {
    // for (let item of )
    let result = shippingMethod.value.find(e => e.enable)
    if (result) return result.id
    else return false
  }

  function getPayment(id, field) {
    let result = payment.value.find(e => e.id === id)
    if (result) {
      if (field) return result[field]
      return result
    } else return false
  }

  function getShippingMethod(id, field) {
    let result = shippingMethod.value.find(e => e.id === id)
    if (result) {
      if (field) return result[field]
      return result
    } else return false
  }

  return {
    payment,
    shippingMethod,
    getStorePS,
    getFirstEnablePaymentId,
    getPayment,
    getFirstEnableShippingMethodId,
    getShippingMethod
  }
}

export const mapStatus = reactive([
  {
    value: -1,
    textClass: 'text-secondary',
    text: '取消'
  },
  {
    value: 0,
    textClass: 'text-warning',
    text: '未成立'
  },
  {
    value: 1,
    textClass: 'text-warning',
    text: '已成立'
  },
  {
    value: 2,
    textClass: 'text-warning',
    text: '已接單'
  },
  {
    value: 3,
    textClass: 'text-success',
    text: '已出貨'
  },
  {
    value: 4,
    textClass: 'text-success',
    text: '已到貨'
  },
  {
    value: 5,
    textClass: 'text-success',
    text: '已完成'
  }
])

export function getMapStatus(status) {
	return mapStatus.find(e => e.value === status)
}