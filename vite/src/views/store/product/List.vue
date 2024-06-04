<template>
  <div class="row pt-4">
    <div class="d-none d-lg-block col-lg-2">
      <div class="mt-2">
        <SearchBar v-model="queryObj.word"></SearchBar>
      </div>
      <hr />
      <CategoryList
        :allCategories="treeList"
        @selected-item="selectedItem"
      >
      </CategoryList>
    </div>
    <div class="col-12 col-lg-10">
      <div class="row g-3 g-lg-4">
        <div class="d-flex d-lg-none">
          <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#MobileFilterModal">
            <i class="fa-solid fa-filter"></i>
            選擇分類/搜尋
          </button>
          <SeletedList
            :selectedCategories="selectedItems"
            :loading="loading"
            @unselected-item="unSelectedItem"
          ></SeletedList>
          <button
            v-if="queryObj.word"
            class="ms-1 btn btn-outline-primary btn-sm d-flex align-items-center"
            @click="unSelectedWord()"
          >
            {{ queryObj.word }}
            <i class="ms-1 fa-regular fa-circle-xmark"></i>
          </button>
        </div>
        <div v-if="loading" class="text-center py-5" style="height: 60vh">
          讀取中...
        </div>
        <div v-if="list.length === 0 && !loading" class="text-center py-5" style="height: 60vh">
          尚無資料
        </div>
        <div v-if="!loading" class="col-6 col-md-4 col-lg-3" v-for="(item, key) in list" :key="key">
          <div class="product-card card">
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
                <div class="cursor-pointer" @click="addCart(item)" data-bs-toggle="modal" data-bs-target="#addCartModal">
                  <i class="fas fa-shopping-cart"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="py-4">
        <pagination
          v-model="currentPage"
          :per-page="perPage"
          :total-data="totalData"
        ></pagination>
      </div>
    </div>
  </div>
  <MobileFilterModal
    v-model="queryObj.word"
    :allCategories="treeList"
		@selected-item="selectedItem"
  ></MobileFilterModal>
  <AddCartModal
    :product="selectedProduct"
  ></AddCartModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { axios } from "@/tools/requestCache";
import CategoryList from "@/components/category/List.vue";
import SeletedList from "@/components/category/SeletedList.vue";
import Pagination from "@/components/Pagination.vue";
import SearchBar from "@/components/SearchBar.vue"
import MobileFilterModal from "@/components/modals/MobileFilterModal.vue"
import AddCartModal from "@/components/modals/AddCartModal.vue"
import { listToTree } from '@/tools/libs'

import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()

const { loading,
	modelName, storeId,
	queryObj, list,
	initQueryObj, getList, getListCount,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'product'
storeId.value = route.params.storeId
perPage.value = 16

initQueryObj({
	//移除storeId,查詢自帶storeId
	categoris: null,
	word: null,
	status: '1',
	sortBy: 'id',
	orderBy: 'desc',
	limit: perPage.value,
	offset: perPage.value * (currentPage.value - 1),
})

if (store.state.preview) {
  queryObj.status = 'all'
}

const productCategory = ref([])
const treeList = ref([])
const selectedItems = ref([])
const selectedProduct = ref(null)

onMounted(() => {
  setQueryObj(route)
  getListAndCount()
  getProductCategory()
})

onBeforeRouteUpdate((to) => {
	// 只有在query改變，並且在同一個router view的時候觸發
	setQueryObj(to)
	getListAndCount()
});

function setQueryObj(route) {
	if (route.query.word) queryObj.word = route.query.word
	else queryObj.word = null
	if (route.query.categoris) queryObj.categoris = route.query.categoris
	else queryObj.categoris = null
	if (route.query.page) currentPage.value = Number(route.query.page)
	else currentPage.value = 1
	queryObj.offset = perPage.value * (currentPage.value - 1)
}

async function getListAndCount() {
	loading.value = true
	await Promise.all([
		getList(queryObj),
		getListCount({
			word: queryObj.word,
			categoris: queryObj.categoris,
			status: queryObj.status,
		}),
	])
  list.value.forEach(e =>
    e.options = e.options ? JSON.parse(e.options) : []
  )
	loading.value = false
}

function getProductCategory() {
  axios.get('/product-category/', {
    params: {
      storeId: storeId.value,
      status: queryObj.status,
      sortBy: 'priority',
      orderBy: 'asc'
    }
  }).then((response) => {
    productCategory.value = response.data
    if (productCategory.value.length === 0) return
    setSelectedByQuery()
    productCategory.value.splice(0, 0, { id: 'root', name: 'root', parentId: null, children: null })
    treeList.value = listToTree(productCategory.value)
  })
}

function setSelectedByQuery() {
  if (!route.query.categoris) return
  productCategory.value.forEach((obj) => {
    if (obj.id == route.query.categoris) {
      obj.active = true
      selectedItems.value.push(obj)
    }
  })
}

function selectedItem(item) {
  selectedItems.value = []
  productCategory.value.forEach((obj) => {
    if (obj.id !== item.id) {
      obj.active = false
    } else {
      selectedItems.value.push(obj)
    }
  })
  const query = Object.assign({}, route.query);
  if (item.id === 'root') delete query.categoris
  else query.categoris = item.id
  if (query.page) delete query.page
  router.push({ query: query })
}

function unSelectedItem(item) {
  productCategory.value.forEach((obj) => {
    if (obj.id === item.id) {
      obj.active = false
    }
  })
  selectedItems.value = []
  const query = Object.assign({}, route.query);
  delete query.categoris
  delete query.page
  router.push({ query: query })
}

function unSelectedWord() {
  queryObj.word = null
  const query = Object.assign({}, route.query);
  delete query.word
  delete query.page
  router.push({ query: query })
}

function addCart(item) {
  selectedProduct.value = item
}
</script>

<style scoped lang="scss">
// .card img {
//   height: 130px;
//   object-fit: cover;
// }

.product-card {
  // width: 180px;
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