<template>
	<div class="row">
    <div class="col-12 col-md-10 offset-md-1">
      <div class="d-flex justify-content-between my-3">
        <div class="fw-bold">最新消息</div>
        <router-link :to="baseUrl + '/post'" class="text-decoration-none" v-if="!postLoading && postList.length !== 0">
          查看全部
          <i class="fa-solid fa-arrow-right"></i>
        </router-link>
      </div>
      <div v-if="postLoading" class="space-row text-center">
        讀取中...
      </div>
      <div v-if="!postLoading && postList.length === 0" class="space-row text-center">
        尚無資料
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
        <router-link :to="baseUrl + '/product'" class="text-decoration-none" v-if="!productLoading && productList.length !== 0">
          查看全部
          <i class="fa-solid fa-arrow-right"></i>
        </router-link>
      </div>
      <div v-if="productLoading" class="space-row text-center">
        讀取中...
      </div>
      <div v-if="!productLoading && productList.length === 0" class="space-row text-center">
        尚無資料
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
                <p v-else class="card-text">
                  <span v-if="item.status === 0" class="text-secondary fst-italic">(未上架)</span>
                  {{ item.name }}
                </p>
              </router-link>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div>${{ item.price }}</div>
              <div class="cursor-pointer" @click="addCart(item)" data-bs-toggle="modal" data-bs-target="#addCartModal">
                <i class="fas fa-shopping-cart"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AddCartModal
    :product="selectedProduct"
  ></AddCartModal>
  <br /><br /><br /><br />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/requestCache";
import AddCartModal from "@/components/modals/AddCartModal.vue"

const store = useStore()
const route = useRoute()
const router = useRouter()

const props = defineProps({
	storeInfo: {
		type: Object,
		default: null
	},
})

const postLoading = ref(false)
const postList = ref([])
const productLoading = ref(false)
const productList = ref([])
const baseUrl = '/store/' + route.params.storeId
const selectedProduct = ref(null)

let queryStatus = '1'

onMounted(() => {
  getPosts()
  getProducts()
})

function getPosts() {
  postLoading.value = true
  axios.get('/post/', {
    params: {
      storeId: route.params.storeId,
      status: queryStatus,
      sortBy: 'id',
      orderBy: 'desc'
    }
  }).then((response) => {
    postList.value = response.data
  }).finally(() => { postLoading.value = false })
}

function getProducts() {
  productLoading.value = true
  axios.get('/product/', {
    params: {
      storeId: route.params.storeId,
      status: queryStatus,
      sortBy: 'id',
      orderBy: 'desc'
    }
  }).then((response) => {
    productList.value = response.data
    productList.value.forEach(e =>
      e.options = e.options ? JSON.parse(e.options) : []
    )
  }).finally(() => { productLoading.value = false })
}

function addCart(item) {
  selectedProduct.value = item
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
.post-card .card-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

.space-row {
  height: 150px;
  padding-top: 50px;
}

</style>