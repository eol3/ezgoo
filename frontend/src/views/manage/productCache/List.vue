<template>
  <div class="row" v-for="(item, key) in list" :key="key">
    <div class="col-1 col-md-1 d-flex justify-content-center">
      <div class="form-check mb-0">
        <input class="form-check-input" type="checkbox" :id="'productItemCheck' + item.id">
      </div>
    </div>
    <div class="col-4 col-md-7 d-flex align-items-center">
      <div>
        <img :src="item.thumbnail ? item.thumbnail : 'https://placehold.co/200'" width='30' class="me-3">
      </div>
      <div class="cut-text">
        {{ item.name }}
      </div>
    </div>
    <div class="col-2 col-md-1">${{ item.price }}</div>
    <div class="col-3 col-md-1 text-center">
      <span v-if="item.status === -1">
        <small>
          <i class="fas fa-circle text-secondary"></i>
          草稿
        </small>
      </span>
      <span v-if="item.status === 0">
        <small>
          <i class="fas fa-circle text-warning"></i>
          未上架
        </small>
      </span>
      <span v-if="item.status === 1">
        <small>
          <i class="fas fa-circle text-success"></i>
          已上架
        </small>
      </span>
    </div>
    <div class="col-2 col-md-2">
      <div class="d-none d-md-block d-flex justify-content-center">
        <router-link class="btn btn-outline-success btn-sm" :to="'/manage/store/16/productcache/' + item.id + '/edit'">
          編輯
        </router-link>
        <button class="btn btn-outline-danger btn-sm" @click="deleteItemInModal(item)">
          刪除
        </button>
      </div>
    </div>
  </div>
  <div class="p-4">
    <pagination
      v-model="currentPage"
      :per-page="perPage"
      :total-data="totalData"
    ></pagination>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import { axios } from "@/tools/requestCache";

const router = useRouter()
const route = useRoute()

import CRUDTools from "@/tools/composition/CRUD";

const emit = defineEmits(['updateLayoutStatus'])

const list = ref([])

const { currentPage, perPage, totalData } = CRUDTools()

const queryObj = reactive({
  storeId: 16,
  status: 'all',
	sortBy: 'id',
	orderBy: 'desc',
})

onMounted(() => {
  setQueryObj()
  getListAndCount()
})

function setQueryObj() {
	if (route.query.page) currentPage.value = Number(route.query.page)
	else currentPage.value = 1
	queryObj.offset = perPage.value * (currentPage.value - 1)
}

function getListAndCount() {
  axios.get('/product/', { params: queryObj }).then(response => {
    list.value = response.data
  })

  axios.get('/product/count', { params: queryObj }).then(response => {
    totalData.value = response.data.total
  })
}


watch(() => route.query, (to, from) => {
  setQueryObj()
  getListAndCount()
})
</script>