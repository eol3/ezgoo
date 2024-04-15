<template>
	<div class="modal fade" id="confirmModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $store.state.modal.title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-html="$store.state.modal.text"></div>
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancel()" :disabled="$store.state.modal.loading">
            {{ $store.state.modal.cancelButtonText }}
          </button>
          <button type="button" class="btn btn-primary" @click="confirm()" :disabled="$store.state.modal.loading">
            {{ $store.state.modal.confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { reactive, onMounted, watch } from 'vue'
import { useStore } from "vuex";

const store = useStore()
let modal = reactive({})

onMounted(() => {
  var modalEl = document.getElementById('confirmModal')
  modal = new Modal(modalEl)
  modalEl.addEventListener('hidden.bs.modal', () => {
    store.state.modal.show = false
  })
})

watch(() => store.state.modal.show , (newValue) => {
	if (newValue) {
    modal.show()
  } else {
    modal.hide()
  }
})

async function confirm() {
  if (store.state.modal.loading) return
  await store.state.modal.confirmCallback()
  initModal()
}
function cancel() {
  store.state.modal.cancelCallback()
  initModal()
}
function initModal() {
  store.commit('setModal', {
    title: "提示",
    show: false,
    loading: false,
    type: "primary",
    text: "",
    confirmButtonText: '確認',
    cancelButtonText: '取消',
    confirmCallback: () =>{},
    cancelCallback: () =>{}
  })
}

</script>

<style>

#confirmModal .modal-backdrop.show {
  opacity: .97;
}

</style>