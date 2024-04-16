<template>
	<div>
		<div class="row justify-content-between">
			<div class="col-12 col-md-8 mb-3 mb-md-0">
				<div class="row">
					<div class="col-auto pe-0">
						<button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#multiSetCategoryModal">批次修改</button>
					</div>
					<div class="col-auto pe-0 d-flex align-items-center">
						<CategoryStatusRow
							v-model="queryObj.categoris"
							:relateQuery="true"
						></CategoryStatusRow>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-4">
				<div class="row justify-content-end">
					<div class="col-auto pe-0">
						<input type="text" class="form-control form-control-sm">
					</div>
					<div class="col-auto my-auto">
						<button class="btn btn-outline-secondary btn-sm">搜尋</button>
					</div>
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
				<div class="col-4 col-md-7">
					商品名稱
				</div>
				<div class="col-2 col-md-1">
					售價
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
				<div class="col-4 col-md-7 d-flex align-items-center">
					<div>
						<img :src="item.thumbnail ? item.thumbnail : 'https://placehold.co/200'" width='30' height="30" class="me-3">
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
	</div>
	<confirm-modal></confirm-modal>
</template>

<script setup>
import { onMounted, onActivated, ref, watch  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate  } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import CategoryStatusRow from '@/components/category/StatusRow.vue';

import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { firstLoad,
	modelName, baseUrl, storeId, itemId,
	queryObj, list,
	initQueryObj, getList, getListCount, deleteItem,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'product'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'

initQueryObj({
	//移除storeId,查詢自帶storeId
	categoris: null,
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
		title: '商品列表',
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
	if (route.query.categoris) queryObj.categoris = route.query.categoris
	else queryObj.categoris = null
	if (route.query.page) currentPage.value = Number(route.query.page)
	else currentPage.value = 1
	queryObj.offset = perPage.value * (currentPage.value - 1)
}

async function getListAndCount() {
	await Promise.all([
		getList(queryObj),
		getListCount({
			categoris: queryObj.categoris,
			status: queryObj.status,
		}),
	])
}

function goMobileDropdownItem(url) {
	setTimeout(() => {
		router.push(url)
	}, 1);
}

function deleteItemInModal(item) {
	store.commit('setModal', {
		show: true,
		text: "<p>確認刪除商品「" + item.name + "」?</p>",
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