<template>
  <!-- <div v-if="store.state.preview" class="bg-success p-2 text-white text-center">
    預覽模式
    <router-link :to="'/manage/store/' + route.params.storeId" class="btn btn-outline-primary btn-sm bg-2">
      返回後台
    </router-link>
  </div> -->
  <template v-if="storeInfo">
    <div v-if="tip" class="bg-warning p-2 text-white text-center">
      {{ tip }}
      <router-link :to="'/manage/store/' + route.params.storeId" class="btn btn-outline-primary btn-sm bg-2">
        前往管理後台
      </router-link>
    </div>
  </template>
  <router-view v-slot="{ Component, route  }">
    <component :is="Component"/>
  </router-view>
</template>
<script setup>
import { ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore()
const route = useRoute()

if (route.query.preview) {
  store.commit('setPreview', true)
} else {
  store.commit('setPreview', false)
}
const storeInfo = ref(null)
const tip = ref(null)
watch(() => store.state.cache, async () => {
	storeInfo.value = await store.dispatch('getCache', 'currentStore')
  if (!storeInfo.value) tip.value = null
  if (storeInfo.value.status === 0) {
    tip.value = '商店未開放，'
  } else if (storeInfo.value.status === 3) {
    tip.value = '商店維護中，'
  }
  if (tip.value) tip.value += '此畫面只有你看的到'
}, { deep: true });
</script>
