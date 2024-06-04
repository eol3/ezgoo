<template>
	<div class="my-3 d-flex justify-content-start">
		<div class="my-auto me-2">
			<div>訂單狀態</div>
		</div>
		<div class="me-2">
			<select class="form-select form-select-sm" v-model="queryObj.status" @change="changeStatus()">
				<option value="all">全部</option>
				<option v-for="(item, key) in mapStatus" :value="item.value">{{ item.text }}</option>
			</select>
		</div>
	</div>
	<div v-if="loading" class="text-center py-5">
		讀取中...
	</div>
	<div v-if="list.length === 0 && !loading" class="text-center py-5">
		尚無資料
	</div>
	<div v-if="list.length !== 0 && !loading" class="row my-2" v-for="(item, key) in list" :key="key">
		<div class="col-6 d-flex align-items-center">
			<div style="width: 80px;">
				<router-link :to="'/order/' + item.id" class="text-decoration-none">
					# {{ item.id }}
				</router-link>
			</div>
			<div class="cut-text">
				{{ getContentText(item.content) }}
			</div>
		</div>
		<div class="col-3 text-center">
			<span >
				<small>
					<i class="fas fa-circle" :class="getMapStatus(item.status).textClass"></i>
					{{ getMapStatus(item.status).text }}
				</small>
			</span>
		</div>
		<div class="col-3">
			<router-link class="btn btn-sm btn-outline-success me-2" :to="'/order/' + item.id">查看</router-link>
		</div>
	</div>
	<div class="p-4">
		<pagination
			v-if="!loading"
			v-model="currentPage"
			:per-page="perPage"
			:total-data="totalData"
		></pagination>
	</div>
</template>

<script setup>
import { onActivated, ref, reactive } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import { isSame } from '@/tools/libs'

import CRUDTools from "@/tools/composition/CRUD";
import { mapStatus, getMapStatus } from "@/tools/composition/order"

const store = useStore()
const route = useRoute()
const router = useRouter()

const { loading,
	modelName, storeId,
	queryObj, list,
	initQueryObj, getList, getListCount,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'order'

initQueryObj({
	status: 'all',
	sortBy: 'updateAt',
	orderBy: 'desc',
	limit: perPage.value,
	offset: perPage.value * (currentPage.value - 1),
})

onActivated(() => {
	setQueryObj(route)
  getListAndCount()
})

onBeforeRouteUpdate((to) => {
	// 只有在query改變，並且在同一個router view的時候觸發
	setQueryObj(to)
	getListAndCount()
});

async function getListAndCount() {
	loading.value = true
	await Promise.all([
		getList(queryObj),
		getListCount({
			status: queryObj.status,
		}),
	])
	loading.value = false
}

function setQueryObj(route) {
	if (route.query.status) queryObj.status = route.query.status
	else queryObj.status = 'all'
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