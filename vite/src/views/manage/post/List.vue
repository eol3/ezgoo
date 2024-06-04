<template>
	<div class="row justify-content-between">
		<div class="col-12 col-lg-6 mb-3 mb-md-0">
			<div class="d-flex">
				<div class="col-auto pe-0 d-flex align-items-center">
					<CategoryStatusRow
						v-model="queryObj.categoris"
						:modelName="'post-category'"
						:relateQuery="true"
						:loading="loading"
					></CategoryStatusRow>
				</div>
			</div>
		</div>
		<div class="col-12 col-lg-6">
			<div class="d-flex justify-content-end">
				<div class="my-auto me-1">
					<div>狀態</div>
				</div>
				<div class="me-2">
					<select class="form-select form-select-sm" v-model="queryObj.status" @change="changeStatus()">
					  <option value="all">全部</option>
					  <option value="0">未公開</option>
					  <option value="1">已公開</option>
					</select>
				</div>
				<SearchBar v-model="queryObj.word"></SearchBar>
			</div>
		</div>
	</div>
	<div v-if="firstLoad" class="text-center py-5" style="height: 60vh">
		讀取中...
	</div>
  <div v-if="list.length === 0 && !firstLoad" class="text-center py-5">
    尚無資料
  </div>
  <div v-if="list.length !== 0 && !firstLoad" class="manage-table">
		<div class="row manage-table-head">
			<div class="col-1 col-md-1 d-flex justify-content-center">
				<div class="form-check mb-0">
				  <input class="form-check-input" type="checkbox" id="productHeadCheck">
				  <!-- <label class="form-check-label" for="productHeadCheck">
				    #
				  </label> -->
				</div>
			</div>
			<div class="col-6 col-md-7">
				貼文內容
			</div>
			<div class="col-3 col-md-1 text-center">
				狀態
			</div>
			<div class="col-2 col-md-1 text-center">
				操作
			</div>
		</div>
		<div class="row" v-for="(item, key) in list" :key="key">
			<div class="col-1 col-md-1 d-flex justify-content-center">
				<div class="form-check mb-0">
				  <input class="form-check-input" type="checkbox" :id="'productItemCheck' + item.id">
				</div>
			</div>
			<div class="col-6 col-md-7 d-flex align-items-center">
				<div>
					<img :src="item.thumbnail ? item.thumbnail : 'https://placehold.co/200'" width='30' height="30" class="me-3">
				</div>
				<div class="cut-text">
					{{ item.content }}
				</div>
			</div>
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
						未公開
					</small>
				</span>
				<span v-if="item.status === 1">
					<small>
						<i class="fas fa-circle text-success"></i>
						已公開
					</small>
				</span>
			</div>
			<div class="col-2 col-md-3">
				<div class="d-none d-md-block d-flex justify-content-center">
					<router-link class="btn btn-outline-secondary btn-sm" :to="'/product/' + item.id + '?storeId=' + storeId + '&preview=true'">
						預覽
					</router-link>
					<router-link class="btn btn-outline-success btn-sm" :to="baseUrl + item.id + '/edit'">
						編輯
					</router-link>
					<button class="btn btn-outline-danger btn-sm" @click="deleteItemInModal(item)">
						刪除
					</button>
				</div>
				<div class="d-block d-md-none d-flex justify-content-center">
					<div class="nav-link icon-link cursor-pointer d-flex justify-content-center align-items-center" style="height: 30px;width: 30px;" id="dropdownNotify" data-bs-toggle="dropdown" aria-expanded="false">
						<i class="fa-solid fa-ellipsis"></i>
					</div>
					<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownNotify">
						<li>
							<button class="dropdown-item" @click="goMobileDropdownItem('/' + modelName + '/' + item.id  + '?storeId=' + storeId + '&preview=true')">
								預覽
							</button>
						</li>
						<li>
							<button class="dropdown-item" @click="goMobileDropdownItem(baseUrl + item.id + '/edit')">
								編輯
							</button>
						</li>
						<li>
							<button class="dropdown-item" @click="deleteItemInModal(item)">
								刪除
							</button>
						</li>
					</ul>
				</div>
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
import { onMounted, onActivated, ref, watch  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate  } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import SearchBar from "@/components/SearchBar.vue"
import CategoryStatusRow from '@/components/category/StatusRow.vue';

import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { firstLoad, loading,
	modelName, baseUrl, storeId, itemId,
	queryObj, list,
	initQueryObj, getList, getListCount, deleteItem,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'post'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'

initQueryObj({
	//移除storeId,查詢自帶storeId
	categoris: null,
	word: null,
	status: 'all',
	sortBy: 'id',
	orderBy: 'desc',
	limit: perPage.value,
	offset: perPage.value * (currentPage.value - 1),
})

onMounted(async () => {
	setQueryObj(route)
	await getListAndCount()
	firstLoad.value = false
})

onActivated(async () => {
	emit('updateLayoutStatus', {
		title: '貼文列表',
		showBack: false,
	})
	
	if (!firstLoad.value) {
		setQueryObj(route)
		getListAndCount()
	}
})

onBeforeRouteUpdate((to) => {
	// 只有在query改變，並且在同一個router view的時候觸發
	setQueryObj(to)
	getListAndCount()
});

function setQueryObj(route) {
	if (route.query.status) queryObj.status = route.query.status
	else queryObj.status = 'all'
	if (route.query.word) queryObj.word = route.query.word
	else queryObj.word = null
	if (route.query.categoris) queryObj.categoris = route.query.categoris
	else queryObj.categoris = null
	if (route.query.page) currentPage.value = Number(route.query.page)
	else currentPage.value = 1
	queryObj.offset = perPage.value * (currentPage.value - 1)
}

function changeStatus() {
	const query = Object.assign({}, route.query);
  query.status = queryObj.status
  if (query.page) delete query.page
  router.push({ query: query })
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

function goMobileDropdownItem(url) {
	setTimeout(() => {
		router.push(url)
	}, 1);
}

function deleteItemInModal(item) {
	let short = item.content
	if (short.length > 10) {
		short = short.substring(0, 10) + '...'
	}
	store.commit('setModal', {
		show: true,
		text: "<p>確認刪除貼文「" + short + "」?</p>",
		confirmCallback: async () => {
			store.state.modal.loading = true
			itemId.value = item.id
			await deleteItem()
			await getListAndCount()
			store.state.modal.show = false
			store.dispatch('showAlert', {
				type: 'success',
				text: '刪除成功'
			})
		}
	})
}

</script>