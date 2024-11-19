<template>
	<div class="modal fade" id="storeOtherUrlModal" data-bs-backdrop="static" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">設定商店相關連結</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-for="(item, key) in selfOtherUrl" class="d-flex justify-content-start align-items-center mb-2">
            <div>
              <div class="row g-3 align-items-center">
                <div class="col-auto">
                  <label class="col-form-label">顯示名稱</label>
                </div>
                <div class="col-auto">
                  <input type="text" class="form-control form-control-sm" v-model="item.name">
                </div>
              </div>
              <div class="row g-3 align-items-center">
                <div class="col-auto">
                  <label class="col-form-label">連結網址</label>
                </div>
                <div class="col-auto">
                  <input type="text" class="form-control form-control-sm" v-model="item.url">
                </div>
              </div>
            </div>
            <div class="ms-3">
              <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="delUrl(key)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
          <div class="mb-3">
            <button class="btn btn-outline-primary btn-sm" @click="newUrl()">新增連結</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="confirm()">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { Modal } from 'bootstrap'
import { onMounted, ref, reactive  } from 'vue'

const store = useStore()
const otherUrl = defineModel()
let modal = reactive({})
const selfOtherUrl = ref([])

onMounted(() => {
  var modalEl = document.getElementById('storeOtherUrlModal')
  modal = new Modal(modalEl)
  modalEl.addEventListener('show.bs.modal', () => {
    selfOtherUrl.value = JSON.parse(JSON.stringify(otherUrl.value))
  })
})

function confirm() {
  for (const item of selfOtherUrl.value) {
    if (item.name === '') {
      store.dispatch('showAlert', {
        type: 'warning',
        text: '尚有名稱未填寫'
      })
      return
    }
    if (item.url === '') {
      store.dispatch('showAlert', {
        type: 'warning',
        text: '尚有連結未填寫'
      })
      return
    }
    let check = isValidHttpUrl(item.url)
    if (!check) {
      store.dispatch('showAlert', {
        type: 'warning',
        text: '連結網址格錯誤'
      })
      return
    } else item.url = check
  }
  otherUrl.value = JSON.parse(JSON.stringify(selfOtherUrl.value))
  modal.hide()
}

async function newUrl() {
  selfOtherUrl.value.push({
    name: '',
    url: ''
  })
}

function delUrl(key) {
  selfOtherUrl.value.splice(key, 1)
}

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  if (url.origin === "null") return false
  
  return url.origin
}
</script>