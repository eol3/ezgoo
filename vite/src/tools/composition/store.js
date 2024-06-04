import { ref, reactive } from 'vue';
import { axios } from "@/tools/requestCache";

export default () => {

  const storeInfo = ref({})
  const payment = ref([])
  const shippingMethod = ref([])
  const setting = ref({})

  async function getStore(storeId) {
    let response = {}
    try {
      response = await axios.get("/store/" + storeId)
      storeInfo.value = response.data
      payment.value = response.data.payment
      shippingMethod.value = response.data.shippingMethod
      setting.value = response.data.setting
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
    storeInfo,
    payment,
    shippingMethod,
    setting,
    getStore,
    getFirstEnablePaymentId,
    getPayment,
    getFirstEnableShippingMethodId,
    getShippingMethod
  }
}