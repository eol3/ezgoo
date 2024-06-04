<template>
	<div class="row">
    <div class="col-12 col-md-10 offset-md-1">
      <div class="d-flex justify-content-between my-3">
        <div class="fw-bold">最新消息</div>
        <router-link :to="baseUrl + '/post'" class="text-decoration-none">
          查看全部
          <i class="fa-solid fa-arrow-right"></i>
        </router-link>
      </div>
      <div class="d-flex flex-nowrap overflow-x-auto mx-1">
        <div class="post-card card flex-shrink-0 mb-3 me-3"
          v-for="(item, key) in postList"
          :key="key"
          @click="router.push('/post/' + item.id)"
        >
          <router-link v-if="item.thumbnail" :to="'/post/'+item.id">
            <img :src="item.thumbnail" class="card-img-top">
          </router-link>
          <div class="card-body d-flex align-items-center align-self-center">
            <p v-if="item.content === ''" class="card-text text-secondary fst-italic">尚無內容</p>
            <router-link v-else :to="'/post/'+item.id" class="text-black text-decoration-none">
              <p class="card-text">{{ item.content }}</p>
            </router-link>
          </div>
        </div>
      </div>
      <hr />
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-md-10 offset-md-1">
      <div class="d-flex justify-content-between my-3">
        <div class="fw-bold">最新上架商品</div>
        <router-link :to="baseUrl + '/product'" class="text-decoration-none">
          查看全部
          <i class="fa-solid fa-arrow-right"></i>
        </router-link>
      </div>
      <div class="d-flex flex-nowrap overflow-x-auto mx-1">
        <div class="product-card card flex-shrink-0 mb-3 me-3"
          v-for="(item, key) in productList"
          :key="key"
        >
          <router-link :to="'/product/'+item.id">
            <img v-if="item.thumbnail" :src="item.thumbnail" class="card-img-top">
            <img v-else src="https://placehold.co/600x400" class="card-img-top">
          </router-link>
          <div class="card-body">
            <div class="body-text-wrap">
              <router-link :to="'/product/'+item.id" class="text-black text-decoration-none">
                <p v-if="item.name === ''" class="card-text text-secondary fst-italic">尚無內容</p>
                <p v-else class="card-text">{{ item.name }}</p>
              </router-link>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div>${{ item.price }}</div>
              <i class="fas fa-shopping-cart"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br /><br /><br />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";

const store = useStore()
const route = useRoute()
const router = useRouter()

const postList = ref([])
const productList = ref([])
const baseUrl = '/store/' + route.params.storeId

let queryStatus = '1'
if (store.state.preview) {
  queryStatus = 'all'
}

onMounted(() => {
  getPosts()
  getProducts()
})

function getPosts() {
  axios.get('/post/', {
    params: {
      storeId: route.params.storeId,
      status: queryStatus,
      sortBy: 'id',
      orderBy: 'desc'
    }
  }).then((response) => {
    postList.value = response.data
  })
}

function getProducts() {
  axios.get('/product/', {
    params: {
      storeId: route.params.storeId,
      status: queryStatus,
      sortBy: 'id',
      orderBy: 'desc'
    }
  }).then((response) => {
    productList.value = response.data
  })
}

</script>

<style scoped lang="scss">
.post-card {
  cursor: pointer;
  width: 180px;
  height: 220px;
}
.post-card img {
  height: 120px;
  object-fit: cover;
}

.product-card {
  width: 180px;
  height: 230px;
}
.product-card img {
  height: 120px;
  object-fit: cover;
}

.product-card .body-text-wrap {
  height: 70%;
}

.product-card .card-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>