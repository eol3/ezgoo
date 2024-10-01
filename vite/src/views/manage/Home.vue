<template>
  <h5>{{ storeInfo.name }}</h5>
  <div class="row justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mt-2">
            <label class="form-label">商店狀態</label>
            <select class="form-select" v-model="formData.status" :disabled="loading">
              <option selected :value="0">未開放</option>
              <option :value="1">開放</option>
              <option :value="2">僅展示，不能下單</option>
              <option :value="3">商店維護中</option>
            </select>
          </div>
          <div class="row mt-3 justify-content-center">
            <div class="col-auto">
              <button class="btn btn-outline-success" @click="save" :disabled="loading">儲存</button>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-if="storeInfo.status === 1 || storeInfo.status === 2">
        <div class="col-md-6">
          <label class="form-label mt-2">複製分享你的商店連結網址</label>
          <div class="input-group mb-3">
            <input type="text" class="form-control" :value="baseUrl + '/store/' + storeInfo.id">
            <button class="btn btn-outline-secondary" @click="copy()">
              <i class="fa-regular fa-copy"></i>
            </button>
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
import { copyTextToClipboard } from '@/tools/libs'

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
const formData = ref({
  status: 0
})
const unHandleNumber = ref(null)
const unShippingNumber = ref(null)
const baseUrl = ref('')

getStore()
onMounted(() => {
  baseUrl.value = window.location.origin
})

axios.get('/order/count?storeId=' + route.params.storeId + '&status=1').then((response) => {
  unHandleNumber.value = response.data.total
})

axios.get('/order/count?storeId=' + route.params.storeId + '&status=2').then((response) => {
  unShippingNumber.value = response.data.total
})

function save() {
  loading.value = true
  axios.put('/store/' + route.params.storeId, { status: formData.value.status }).then(() => {
    storeInfo.value.status = formData.value.status
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
    formData.value.status = storeInfo.value.status
  }).finally(() => { loading.value = false })
}

function copy() {
  let url = baseUrl.value + '/store/' + storeInfo.value.id
  copyTextToClipboard(url);
  store.dispatch('showAlert', {
    type: 'success',
    text: '連結複製成功'
  })
}

// defineFormData({
//   status: 0,
// })

// onMounted(() => {
//   getItem({ status: 'all' })
// })

</script>
