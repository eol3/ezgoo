<template>
  <div class="row justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3" v-for="item of payment">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" :id="'swaitch_'+item.id" v-model="item.enable">
              <label class="form-check-label" :for="'swaitch_'+item.id">{{ item.name }}</label>
            </div>
            <!-- <div class="mb-1 d-flex">
              <label class="form-label me-2 mt-1">費用</label>
              <div>
                <input type="number" class="form-control form-control-sm" v-model="item.fee" :disabled="loading">
              </div>
            </div> -->
            <textarea
              class="form-control"
              rows="2"
              v-model="item.tip"
              :disabled="loading"
              placeholder="商家提醒"
            ></textarea>
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
const payment = ref([
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

onActivated(() => {
  emit('updateLayoutStatus', {
    title: '付款設定',
    showBack: true,
  })
  loading.value = true
  axios.get('/store/' + route.params.storeId).then((response) => {
    if (response.data.payment) {
      // processData(response.data.payment)
      payment.value = response.data.payment
    }
  }).finally(() => { loading.value = false })
})

function processData(data) {
  for (let i in data) {
    if (data[i].id === 3 && data[i].name === '信用卡') {
      data.splice(i, 1) //信用卡暫時不用
    }
  }
}

function save() {
  if (loading.value) return

  loading.value = true
  axios.put('/store/' + route.params.storeId, {
    payment: payment.value
  }).then(() => {
    store.dispatch('showAlert', {
      type: 'success',
      text: '修改成功'
    })
  }).finally(() => { loading.value = false })
}
</script>