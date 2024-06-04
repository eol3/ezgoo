<template>
  <div v-if="store.state.preview" class="bg-success p-2 text-white text-center">
    預覽模式
  </div>
  <router-view v-slot="{ Component, route  }">
    <component :is="Component"/>
  </router-view>
</template>
<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

const store = useStore()
const route = useRoute()
const router = useRouter()

if (route.query.preview) {
  store.commit('setPreview', true)
} else {
  store.commit('setPreview', false)
}
</script>
