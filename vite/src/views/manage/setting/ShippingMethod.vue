<template>
  <div class="row justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3" v-for="item of shippingMethod">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" :id="'swaitch_'+item.id" v-model="item.enable">
              <label class="form-check-label" :for="'swaitch_'+item.id">{{ item.name }}</label>
            </div>
            <div class="mb-1 d-flex">
              <label class="form-label me-2 mt-1">費用</label>
              <div>
                <input type="number" class="form-control form-control-sm" v-model="item.fee" :disabled="loading">
              </div>
            </div>
            <textarea
              class="form-control"
              rows="2"
              v-model="item.tip"
              :disabled="loading"
              placeholder="商家提醒"
            ></textarea>
          </div>
          <hr />
          <div class="form-group mt-2">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="swaitch_shipping" v-model="enableShipping">
              <label class="form-check-label" for="swaitch_shipping">訂單滿額免運</label>
            </div>
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label class="col-form-label">訂單金額</label>
              </div>
              <div class="col-auto">
                <input
                  type="number"
                  class="form-control"
                  @focus="error = false"
                  v-model="setting.untilAmountFreeShipping"
                  :disabled="loading || !enableShipping"
                >
              </div>
            </div>
            <div class="form-text text-danger" v-if="error">
              {{ error }}
            </div>
          </div>
          <div class="row mt-3 justify-content-center">
            <div class="col-auto">
              <button class="btn btn-outline-success" @click="save" :disabled="loading">儲存</button>
            </div>
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
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const loading = ref(false)
const shippingMethod = ref([
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

const setting = ref({
  untilAmountFreeShipping: null, // 訂單達到多少免運費
  allowOrderWithoutLogIn: true // 允許未登入下單
})

const enableShipping = ref(false)
const error = ref(false)

onActivated(() => {
  emit('updateLayoutStatus', {
    title: '運送方式設定',
    showBack: true,
  })
  loading.value = true
  axios.get('/store/' + route.params.storeId).then((response) => {
    if (response.data.shippingMethod) {
      shippingMethod.value = response.data.shippingMethod
    }
    if (response.data.setting) {
      setting.value = response.data.setting
    }
    if (setting.value.untilAmountFreeShipping) {
      enableShipping.value = true
    }
  }).finally(() => { loading.value = false })
})

function save() {
  if (loading.value) return

  if (!enableShipping.value) {
    setting.value.untilAmountFreeShipping = null
  } else {
    if (!setting.value.untilAmountFreeShipping) {
      error.value = '請輸入訂單金額'
      return
    }
    if (setting.value.untilAmountFreeShipping <= 0) {
      error.value = '訂單金額必須大於0'
      return
    }
  }

  loading.value = true

  axios.put('/store/' + route.params.storeId, {
    shippingMethod: shippingMethod.value,
    setting: setting.value
  }).then(() => {
    store.dispatch('showAlert', {
      type: 'success',
      text: '修改成功'
    })
  }).finally(() => { loading.value = false })
}
</script>