<template>
  <div class="container">
    <div class="row">
      carousel
    </div>
    <div class="row justify-content-between py-3">
			<div class="col-12 col-md-6 offset-md-1 mb-3 mb-md-0">
			  <div class="d-flex flex-row">
			    <div class="mx-2 my-auto">
    			  <img
              src="https://placehold.co/200"
              class="rounded-circle avatar-image"
              width="60"
            />
          </div>
          <div class="my-auto">
            <div class="fs-5" style="word-wrap: break-word;">
              {{ store.name }}
            </div>
          </div>
        </div>
			</div>
			<div class="col-12 col-md-4 my-auto">
			  <div class="d-flex flex-row">
			    <button class="btn btn-outline-primary me-2 mobile-width-100">追蹤</button>
			    <button class="btn btn-outline-success mobile-width-100" @click="$router.push('/manage/store/' + $route.params.storeId)">管理後台</button>
			  </div>
			</div>
		</div>
    <div class="row">
      <div class="col-12 col-md-6 col-lg-6 offset-md-1">
        <nav class="nav nav-tabs">
          <li class="nav-item">
            <router-link
              :class="['nav-link']"
              :to="'/store/' + $route.params.storeId"
            >
              首頁
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link']"
              :to="'/store/' + $route.params.storeId + '/product' + queryString"
            >
              商品
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link']"
              :to="'/store/' + $route.params.storeId + '/post'"
              >貼文</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link']"
              :to="'/store/' + $route.params.storeId + '/about'"
              >關於</router-link
            >
          </li>
        </nav>
      </div>
    </div>
  </div>
  <div class="bg-1">
    <div class="container">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script>
// import noImageSm from '@/assets/no-image-sm.webp'

export default {
  name: "storeHead",
  data() {
    return {
      store: {}
    }
  },
  created() {
    this.axios.get('/store/' + this.$route.params.storeId).then(response => {
      this.store = response.data
    })
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

#carouselStoreControls .carousel-item {
  height: 40vh;
}

@include media-breakpoint-down(md) {
  #carouselStoreControls .carousel-item {
    height: 25vh;
  }
}

.store-wrap {
  border-left: 1px solid $gray-300;
  border-right: 1px solid $gray-300;
}
</style>