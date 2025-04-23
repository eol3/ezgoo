<template>
  <div class="me-1">
    <div class="input-group">
      <input type="text" class="search-input form-control form-control-sm" v-model="word" @keyup.enter="goSearch()">
      <span class="input-group-text custom-input-text" v-if="word !== '' && word !== null" @click="clear()">
        <i class="far fa-times-circle"></i>
      </span>
      <button v-if="showBarcode" class="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="modal" data-bs-target="#scanBarcodeModal">
        <i class="fa-solid fa-barcode"></i>
      </button>
      <button class="btn btn-outline-secondary btn-sm" @click="clickSearchBtn()">搜尋</button>
    </div>
  </div>
  <ScanBarcodeModal v-if="showBarcode" @detectedBarcode="detectedBarcode"></ScanBarcodeModal>
</template>

<script setup>
import { nextTick } from 'vue'
import { useRoute, useRouter } from "vue-router";
import ScanBarcodeModal from '@/components/modals/ScanBarcodeModal.vue'

const route = useRoute()
const router = useRouter()
const word = defineModel()

const props = defineProps({
  showBarcode: {
		type: Boolean,
		default: false
	},
})

const emit = defineEmits(['clickSearch'])

function clickSearchBtn() {
  emit('clickSearch')
  goSearch()
}

function goSearch() {
	const query = Object.assign({}, route.query)
  if (word.value === '') {
    delete query.word
  } else {
    query.word = word.value
  }
  if (query.page) delete query.page
  router.push({ query: query })
}

function clear() {
  word.value = ''
  nextTick(() => {
    goSearch()
  })
}

function detectedBarcode(barcode) {
	word.value = barcode
  nextTick(() => {
    goSearch()
  })
}

</script>

<style>
.search-input,
.search-input:focus {
  border-right: none;
}
.custom-input-text {
  cursor: pointer;
  background-color: #fff;
  border-left: none;
}
</style>