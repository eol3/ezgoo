<template>
  <div class="row pt-4">
    <div class="d-none d-lg-block col-lg-2">
      <div class="mt-2">
        <SearchBar v-model="queryObj.word"></SearchBar>
      </div>
      <hr v-if="treeList.length !== 0" />
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
          <div class="post-card card" @click="router.push('/post/' + item.id)">
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from "vue-router";
import { axios } from "@/tools/requestCache";
import CategoryList from "@/components/category/List.vue";
import SeletedList from "@/components/category/SeletedList.vue";
import Pagination from "@/components/Pagination.vue";
import SearchBar from "@/components/SearchBar.vue"
import MobileFilterModal from "@/components/modals/MobileFilterModal.vue"
import { setHead, listToTree, traverseSubtree } from '@/tools/libs'

import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()

const { loading,
	modelName, storeId,
	queryObj, list,
	initQueryObj, getList, getListCount,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'post'
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

const postCategory = ref([])
const treeList = ref([])
const selectedItems = ref([])

const storeInfo = ref(null)

onMounted(() => {
  setQueryObj(route)
  getListAndCount()
  getPostCategory()
})

onBeforeRouteUpdate((to) => {
	// 只有在query改變，並且在同一個router view的時候觸發
	setQueryObj(to)
	getListAndCount()
});

onBeforeRouteLeave((to, from) => {
  if (to.path.startsWith('/store/')) {
    setSelfHead('')
  }
})

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
	loading.value = false
}

function getPostCategory() {
  axios.get('/post-category/', {
    params: {
      storeId: storeId.value,
      status: queryObj.status,
      sortBy: 'priority',
      orderBy: 'asc'
    }
  }).then((response) => {
    postCategory.value = response.data
    if (postCategory.value.length === 0) return
    setSelectedByQuery()
    postCategory.value.splice(0, 0, { id: 'root', name: 'root', parentId: null, children: null })
    treeList.value = listToTree(postCategory.value)
  })
}

function setSelectedByQuery() {
  if (!route.query.categoris) return
  let firstCategoryId = route.query.categoris.split('-')[0]
  for (const item of postCategory.value) {
    if (item.id == firstCategoryId) {
      item.active = true
      selectedItems.value.push(item)
      setSelfHead(item.name + ' - ')
      break
    }
  }
}

function selectedItem(item) {
  selectedItems.value = []
  postCategory.value.forEach((obj) => {
    if (obj.id !== item.id) {
      obj.active = false
    } else {
      selectedItems.value.push(obj)
    }
  })
  const query = Object.assign({}, route.query);
  if (item.id === 'root') {
    delete query.categoris
    setSelfHead('')
  } else {
    let ids = ''
    traverseSubtree(treeList.value, item.id, (node) => {
      ids += node.id + '-'
    });
    ids = ids.slice(0, -1)
    query.categoris = ids
    setSelfHead(selectedItems.value[0].name + ' - ')
  }
  if (query.page) delete query.page
  router.push({ query: query })
}

function unSelectedItem(item) {
  postCategory.value.forEach((obj) => {
    if (obj.id === item.id) {
      obj.active = false
    }
  })
  selectedItems.value = []
  const query = Object.assign({}, route.query);
  delete query.categoris
  delete query.page
  router.push({ query: query })
  setSelfHead('')
}

function unSelectedWord() {
  queryObj.word = null
  const query = Object.assign({}, route.query);
  delete query.word
  delete query.page
  router.push({ query: query })
}

async function setSelfHead(text) {
  storeInfo.value = await store.dispatch('getCache', 'currentStore')
  setHead({
    title: text + storeInfo.value.name,
    description: text + storeInfo.value.about,
    url: document.URL
  })
}
</script>

<style scoped lang="scss">
.post-card {
  cursor: pointer;
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
</style>