<template>
	<div class="row justify-content-between">
		<div class="col-12 col-lg-6 mb-3 mb-md-0">
			<div class="d-flex">
				<div class="col-auto pe-0 d-flex align-items-center">
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
						<option v-for="(item, key) in mapStatus" :value="item.value">{{ item.text }}</option>
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
				訂單內容
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
				<div style="width: 40px;">
					# {{ item.id }}
				</div>
				<div class="cut-text">
					{{ getContentText(item.content) }}
				</div>
			</div>
			<div class="col-3 col-md-1 text-center">
				<span >
					<small>
						<i class="fas fa-circle" :class="getMapStatus(item.status).textClass"></i>
						{{ getMapStatus(item.status).text }}
					</small>
				</span>
			</div>
			<div class="col-2 col-md-2">
				<div class="d-none d-md-block d-flex justify-content-center">
					<router-link class="btn btn-outline-success btn-sm" :to="baseUrl + item.id + '/edit'">
						編輯
					</router-link>
				</div>
				<div class="d-block d-md-none d-flex justify-content-center">
					<div class="nav-link icon-link cursor-pointer d-flex justify-content-center align-items-center" style="height: 30px;width: 30px;" id="dropdownNotify" data-bs-toggle="dropdown" aria-expanded="false">
						<i class="fa-solid fa-ellipsis"></i>
					</div>
					<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownNotify">
						<li>
							<button class="dropdown-item" @click="goMobileDropdownItem(baseUrl + item.id + '/edit')">
								編輯
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
import { onMounted, onActivated, ref, reactive, watch  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate  } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import SearchBar from "@/components/SearchBar.vue"
import { isSame } from '@/tools/libs'

import CRUDTools from "@/tools/composition/CRUD";
import { mapStatus, getMapStatus } from "@/tools/composition/order"

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { firstLoad, loading,
	modelName, baseUrl, storeId, itemId,
	queryObj, list,
	initQueryObj, getList, getListCount, deleteItem,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'order'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'

initQueryObj({
	//移除storeId,查詢自帶storeId
	word: null,
	status: 'all',
	sortBy: 'createAt',
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
		title: '訂單列表',
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

function getContentText(content) {
	let text = ''
	for(let item of content) {
		text += item.name + '*' + item.choiceNumber
		if (!isSame(item.selectedOptions, [null, null, null])) {
			text += '(' + item.selectedOptions.filter(Boolean).join(',') + ')'
		}
		text += ','
	}
	return text.slice(0, -1)
}

</script>