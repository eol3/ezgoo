<template>
	<div>
		<div class="row justify-content-between">
			<div class="col-12 col-md-4 mb-3 mb-md-0">
				<div class="row">
					<div class="col-auto pe-0">
						<button class="btn btn-outline-secondary btn-sm">批次修改</button>
					</div>
					<div class="col-auto">
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6">
				<div class="row justify-content-end">
					<div class="col-auto pe-0">
						<button class="btn btn-outline-secondary btn-sm">選擇分類</button>
					</div>
					<div class="col-auto pe-0">
						<input type="text" class="form-control">
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
						<img src="https://placehold.co/200" width='30' class="me-3">
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
						<router-link class="btn btn-outline-secondary btn-sm" :to="'/product/' + item.id + '?storeId=' + route.params.storeId + '&preview=true'">
							預覽
						</router-link>
						<router-link class="btn btn-outline-secondary btn-sm" :to="'/manage/store/' + route.params.storeId + '/product/' + item.id + '/edit'">
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
								<button class="dropdown-item" @click="goMobileDropdownItem('/' + modelName + '/' + item.id  + '?storeId=' + route.params.storeId + '&preview=true')">
									預覽
								</button>
							</li>
							<li>
								<button class="dropdown-item" @click="goMobileDropdownItem('/manage/store/' + route.params.storeId + '/' + modelName + '/' + item.id + 'edit/')">
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
import { onMounted, onActivated, watch  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter, onBeforeRouteUpdate  } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";

import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { firstLoad,
	modelName,
	queryObj, list,
	initQueryObj, getList, getListCount, deleteItem,
	currentPage, perPage, totalData } = CRUDTools()

modelName.value = 'product'

initQueryObj({
	storeId: route.params.storeId,
	status: 'all',
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
	if (!firstLoad.value && store.state.updateData === true) {
		store.state.updateData = false
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
	if (route.query.page) currentPage.value = Number(route.query.page)
	else currentPage.value = 1
	queryObj.offset = perPage.value * (currentPage.value - 1)
}

async function getListAndCount() {
	await Promise.all([
		getList(queryObj),
		getListCount({
			storeId: queryObj.storeId,
			status: queryObj.status,
		})
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
			await deleteItem(item.id, { storeId: route.params.storeId })
			await getListAndCount()
			store.state.modal.show = false
			store.dispatch('showAlert', {
				type: 'success',
				text: '刪除成功'
			})
		}
	})
}

// const firstLoad = ref(true)

// const currentPage = ref(1)
// const perPage = ref(10)
// const totalData = ref(0)

// const list = ref([])
// const queryObj = ref({
// 	storeId: route.params.storeId,
// 	status: 'all',
// 	sortBy: 'id',
// 	orderBy: 'desc',
// 	limit: perPage.value,
// 	offset: perPage.value * (currentPage.value - 1),
// })

// onMounted(async () => {	
	
// })

// onActivated(async () => {
// 	emit('updateLayoutStatus', {
// 		title: '商品列表',
// 		showBack: false,
// 	})
// 	setQueryObj()
// 	await getList()
// 	await getListCount()
// 	firstLoad.value = false
// })

// function setQueryObj() {
// 	if (route.query.page) currentPage.value = Number(route.query.page)
// 	queryObj.limit = perPage.value
// 	queryObj.offset = perPage.value * (currentPage.value - 1)
// }

// async function getList() {
// 	let response = {}
// 	try {
// 		response = await axios.get("/product", {
// 			params: queryObj
// 		})
// 		list.value = response.data
// 	} catch(e) {
// 		console.log(e)
// 	}
// }

// async function getListCount() {
// 	let response = {}
// 	try {
// 		response = await axios.get("/product/count", {
// 			params: {
// 				storeId: queryObj.storeId,
// 				status: queryObj.status,
// 			}
// 		})
		
// 		totalData.value = response.data.total
// 	} catch(e) {
// 		console.log(e)
// 	}
// }

// function goEdit(productId) {
// 	setTimeout(() => {
// 		router.push('/manage/store/' + route.params.storeId + '/product/edit/' + productId)
// 	}, 1);
// }

// function deleteProduct(productId) {
// 	store.commit('setModal', {
// 		show: true,
// 		text: "<p>確認刪除商品?</p>",
// 		confirmCallback: async () => {
// 			store.state.modal.loading = true
// 			let response = {}
// 			try {
// 				response = await axios.delete('/product/' + productId)
// 			} catch(e) {
// 				console.log(e)
// 			}
// 			await getList()
// 			await getListCount()
// 			store.state.modal.show = false
// 			store.dispatch('showAlert', {
// 				type: 'success',
// 				text: response.data.msg
// 			})
// 		}
// 	})
// }

// watch(() => route.query.page, () => {
// 	console.log('watch')
// 	if (route.path !== '/manage/store/' + route.params.storeId + '/product') return 
// 	setQueryObj()
// 	getList()
// 	getListCount()
// })

</script>

<script>
// export default {
// 	watch: {
//     $route (to, from) {
//       console.log('1', to.name, from.name)
// 			if (to.name !== 'ProductList' && from.name !== 'ProductList') return
// 			this.setQueryObj()
// 			this.getListAndCount()
//     }
//   },
// }
</script>