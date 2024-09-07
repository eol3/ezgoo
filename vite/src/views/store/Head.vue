<template>
  <div class="store-head-wrap container">
    <div v-if="storeImages.length === 0" class="no-carousel">
    </div>
    <div id="carouselStoreControls" class="carousel slide">
      <div class="carousel-indicators" v-if="storeImages.length > 1">
        <template v-for="(index, key) in storeImages.length">
          <button type="button" data-bs-target="#carouselStoreControls" :data-bs-slide-to="key" :class="{ active: key === 0 }"></button>
        </template>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item" :class="{ active: key === 0 }" v-for="(item, key) in storeImages" :key="key">
          <img :src="item.baseUrl + item.path + '/' + item.filename" class="d-block w-100" alt="...">
        </div>
      </div>
      <button v-if="storeImages.length > 1" class="carousel-control-prev" type="button" data-bs-target="#carouselStoreControls" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button v-if="storeImages.length > 1" class="carousel-control-next" type="button" data-bs-target="#carouselStoreControls" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
  <div class="container">
    <div class="row justify-content-between py-3">
			<div class="col-12 col-md-6 offset-md-1 mb-3 mb-md-0">
			  <div class="d-flex flex-row">
			    <div class="mx-2 my-auto">
    			  <img
              v-if="storeInfo.thumbnail"
              :src="storeInfo.thumbnail"
              class="rounded-circle avatar-image"
              width="60"
            />
            <div v-else class="no-image d-flex align-items-center justify-content-center bg-gray-200">
              <i style="font-size: 12px;" v-if="storeInfo.thumbnail !== undefined">尚無圖片</i>
            </div>
          </div>
          <div class="my-auto store-name-row">
            <div class="fs-5 fw-bold cut-text">
              {{ storeInfo.name }}
            </div>
            <div class="text-secondary cut-text">
              {{ storeInfo.about }}
            </div>
          </div>
        </div>
			</div>
			<div class="col-12 col-md-4 my-auto">
			  <div class="d-flex flex-row">
			    <!--<button class="btn btn-outline-primary me-2 mobile-width-100">追蹤</button>-->
			    <button v-if="userStore.roleGroup === 'manage'" class="btn btn-outline-success mobile-width-100" @click="router.push('/manage/store/' + route.params.storeId)">管理後台</button>
			  </div>
			</div>
		</div>
    <div class="row">
      <div class="col-12 col-md-10 offset-md-1">
        <nav class="nav nav-tabs">
          <li class="nav-item">
            <router-link
              :class="['nav-link', { 'active': isActive('') }]"
              :to="baseUrl"
            >
              首頁
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { 'active': isActive('/product') }]"
              :to="baseUrl + '/product'"
            >
              商品
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { 'active': isActive('/post') }]"
              :to="baseUrl + '/post'"
              >貼文</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { 'active': isActive('/about') }]"
              :to="baseUrl + '/about'"
              >關於</router-link
            >
          </li>
        </nav>
      </div>
    </div>
  </div>
  <div class="bg-1 flex-grow-1">
    <div class="container">
      <router-view v-slot="{ Component }" v-if="storeReady">
        <component :is="Component"/>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";
// import * as bootstrap from 'bootstrap'

const store = useStore()
const route = useRoute()
const router = useRouter()

const storeInfo = ref({})
const storeReady = ref(false)
const baseUrl = ref('/store/' + route.params.storeId)
const storeImages = ref([])
const userStore = ref({})

let queryStatus = '1'
if (store.state.preview) {
  queryStatus = 'all'
}

onMounted(() => {
  window.scrollTo(0, 0)
  // const carousel = new bootstrap.Carousel('#carouselStoreControls')
  // console.log(carousel)
})

watch(() => route.params.storeId, (newStoreId) => {
  if (newStoreId) {
    getStore()
  }
})

if (isNaN(parseFloat(route.params.storeId))) {
  axios.get('/store/account/' + route.params.storeId).then(response => {
    router.push('/store/' + response.data.id)
  })
} else {
  getStore()
}

function getStore() {
  storeReady.value = true
  baseUrl.value = '/store/' + route.params.storeId
  axios.get(baseUrl.value, {
    params: {
      status: queryStatus,
    }
  }).then(response => {
    storeInfo.value = response.data
    store.dispatch('setCache', {
      key: 'currentStore',
      value: storeInfo.value
    })
  })
  axios.get(baseUrl.value + '/images', {
    params: {
      status: queryStatus,
      type: '0',
      sortBy: 'priority',
      orderBy: 'desc'
    }
  }).then(response => {
    storeImages.value = response.data
  })

  if (store.state.localUser) {
    axios.get('/user/store/' + route.params.storeId).then(response => {
      userStore.value = response.data
      store.dispatch('setCache', {
        key: 'currentUserStore',
        value: userStore.value
      })
    })
  }
}

function isActive(checkUrl) {
  return route.path === baseUrl.value + checkUrl
}

</script>

<style scoped lang="scss">

.bg-1 {
  background-color: var(--d-gray-100);
}

.nav-tabs .nav-link.active,
.nav-tabs .nav-link.active:hover,
.nav-tabs .nav-link.active:focus {
  color: $primary;
  border-color: $white $white $primary $white;
  border-bottom-width: 3px;
}

.nav-tabs .nav-link {
  color: var(--d-gray-700);
}

.nav-tabs .nav-link:hover,
.nav-tabs .nav-link:focus {
  border-color: $white;
}

#carouselStoreControls .carousel-item {
  height: 25vh;
}

.store-name-row {
  width: 100%;
}

@include media-breakpoint-down(md) {
  .store-head-wrap {
    padding-left: 0rem;
    padding-right: 0rem;
  }
  #carouselStoreControls .carousel-item {
    height: 25vh;
  }
  .no-carousel {
    height: 25vh;
  }
  .store-name-row {
    width: 75%;
  }
}

.no-carousel {
  width: 100%;
  height: 25vh;
  background-color: var(--d-gray-200);
}

</style>