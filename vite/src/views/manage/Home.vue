<template>
  <h5>{{ storeInfo.name }}</h5>
  <div class="row justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mt-2">
            <label class="form-label">商店狀態</label>
            <select class="form-select" v-model="storeInfo.status" :disabled="loading">
              <option selected value="0">未開放</option>
              <option value="1">開放</option>
              <option value="2">僅展示，不能下單</option>
              <option value="3">商店維護中</option>
            </select>
          </div>
          <div class="row mt-3 justify-content-center">
            <div class="col-auto">
              <button class="btn btn-outline-success" @click="save" :disabled="loading">儲存</button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mt-2">
            <label class="form-label">訂單狀態</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6 col-md-3">
          <div class="card">
            <router-link :to="'/manage/store/' + route.params.storeId + '/order?status=1'" class="text-black text-decoration-none">
              <div class="card-body text-center">
                <h5>未接單</h5>
                <hr />
                {{ unHandleNumber }}
              </div>
            </router-link>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card">
            <router-link :to="'/manage/store/' + route.params.storeId + '/order?status=2'" class="text-black text-decoration-none">
              <div class="card-body text-center">
                <h5>未出貨</h5>
                <hr />
                {{ unShippingNumber }}
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onActivated, ref  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";

const store = useStore()
const route = useRoute()
// import wrapValidator from '@/tools/validator'
// import CRUDTools from "@/tools/composition/CRUD";

// const { loading, baseUrl, storeId, itemId,
// 	modelName, formMode, formData, defineFormData,
// 	formValid, formValidFeild, formValidClear,
// 	getItem, saveItem } = CRUDTools()

// modelName.value = 'store'
// itemId.value = route.params.storeId
// formMode.value = 'edit'

const loading = ref(false)
const storeInfo = ref({})
const unHandleNumber = ref(null)
const unShippingNumber = ref(null)

getStore()

axios.get('/order/count?storeId=' + route.params.storeId + '&status=1').then((response) => {
  unHandleNumber.value = response.data.total
})

axios.get('/order/count?storeId=' + route.params.storeId + '&status=2').then((response) => {
  unShippingNumber.value = response.data.total
})

function save() {
  loading.value = true
  axios.put('/store/' + route.params.storeId, { status: Number(storeInfo.value.status) }).then(() => {
    store.dispatch('showAlert', {
      type: 'success',
      text: '儲存成功'
    })
  }).catch((error) => {
    if (error.response.status === 422) {
      getStore()
    }
  }).finally(() => { loading.value = false })
}

function getStore() {
  loading.value = true
  axios.get('/store/' + route.params.storeId).then((response) => {
    storeInfo.value = response.data
  }).finally(() => { loading.value = false })
}

// defineFormData({
//   status: 0,
// })

// onMounted(() => {
//   getItem({ status: 'all' })
// })

</script>
