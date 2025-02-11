<template>
  <div class="me-1">
    <div class="input-group">
      <input type="text" class="search-input form-control form-control-sm" v-model="word">
      <span class="custom-input-text" v-if="word !== '' && word !== null" @click="clear()">
        <i class="far fa-times-circle"></i>
      </span>
      <button class="btn btn-outline-secondary btn-sm" @click="clickSearchBtn()">搜尋</button>
    </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue'
import { useRoute, useRouter } from "vue-router";

const route = useRoute()
const router = useRouter()
const word = defineModel()

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
</script>

<style>
.search-input,
.search-input:focus {
  border-right: none;
}
.custom-input-text {
  cursor: pointer;
  position: absolute;
  right: 55px;
  top: 2.5px;
  z-index: 5;
}
</style>