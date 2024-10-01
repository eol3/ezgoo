<template>
	<div class="modal fade" id="datePickerModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">日期選擇</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">開始日期</label>
            <input type="date" class="form-control" v-model="dateRange.startAt">
          </div>
          <div class="mb-3">
            <label class="form-label">結束日期</label>
            <input type="date" class="form-control" v-model="dateRange.endAt">
          </div>
          <div class="py-3 text-center">
            <button class="btn btn-outline-primary" @click="confirm()">確認查詢</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { useStore } from "vuex";
import { ref, reactive, onMounted, } from 'vue'
import moment from 'moment';

const store = useStore()

const emit = defineEmits(['selectedDate'])
let modal = reactive({})
const dateRange = reactive({
  startAt: moment().format("YYYY-MM-DD"),
  endAt: moment().format("YYYY-MM-DD")
})

onMounted(() => {
  var modalEl = document.getElementById('datePickerModal')
  modal = new Modal(modalEl)
})

function confirm() {
  if (moment(dateRange.endAt).isBefore(moment(dateRange.startAt))) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '開始日期不能大於結束日期'
    })
    return
  }
  emit('selectedDate', dateRange)
  modal.hide()
}

</script>