import { ref, reactive } from 'vue';
import { axios } from "@/tools/requestCache";

export default () => {

  const storeInfo = ref({
    payment: [],
    shippingMethod: [],
  })
  const defaultPayment = ref([
    {
      id: 1,
      name: '匯款',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 2,
      name: '取貨付款',
      enable: false,
      tip: '',
      fee: 0,
    }
  ])
  const defaultShippingMethod = ref([
    {
      id: 1,
      name: '宅配',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 2,
      name: '到店取貨',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
      id: 3,
      name: '超商取貨',
      enable: false,
      tip: '',
      fee: 0,
    },
    {
        id: 4,
        name: '面交',
        enable: false,
        tip: '',
        fee: 0,
      },
  ])

  async function getStore(storeId) {
    let response = {}
    try {
      response = await axios.get("/store/" + storeId + "?status=1")
      storeInfo.value = response.data
      // payment.value = response.data.payment
      // shippingMethod.value = response.data.shippingMethod
      // setting.value = response.data.setting
      return response
    } catch(error) {
      console.log(error)
      throw error;
    }
  }

  function getFirstEnablePaymentId() {
    let result = storeInfo.value.payment[0]
    if (result) return result.id
    else return false
  }

  function getFirstEnableShippingMethodId() {
    // for (let item of )
    let result = storeInfo.value.shippingMethod.find[0]
    if (result) return result.id
    else return false
  }

  function getPayment(id, field) {
    let result = storeInfo.value.payment.find(e => e.id === id)
    if (result) {
      if (field) return result[field]
      return result
    } else return false
  }

  function getShippingMethod(id, field) {
    let result = storeInfo.value.shippingMethod.find(e => e.id === id)
    if (result) {
      if (field) return result[field]
      return result
    } else return false
  }

  return {
    storeInfo,
    defaultPayment,
    defaultShippingMethod,
    getStore,
    getFirstEnablePaymentId,
    getPayment,
    getFirstEnableShippingMethodId,
    getShippingMethod
  }
}