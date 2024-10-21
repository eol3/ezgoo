<template>
	<div class="desktop-pagination">
		<nav v-show="totalPage > 1" aria-label="Page navigation">
		  <ul class="pagination mb-0">
		    <li v-if="beforeHide" class="page-item">
		      <button class="page-link" @click="firstPage()">
		        <span aria-hidden="true">&laquo;</span>
		      </button>
		    </li>
		    <li v-if="currentPage !== 1" :class="['page-item', {disabled: disableFirstPage()}]">
		      <button class="page-link" @click="prevPage()">
		        <span aria-hidden="true">&#60;</span>
		      </button>
		    </li>
		    <li v-for="(item, key) in pages" :class="['page-item', {active: isCurrentPage(item)}]" :key="key">
		    	<button class="page-link" @click="changePage(item)">{{ item }}</button>
		    </li>
		    <li v-if="currentPage !== totalPage" :class="['page-item', {disabled: disableLastPage()}]">
		      <button class="page-link" @click="nextPage()">
		        <span aria-hidden="true">&#62;</span>
		      </button>
		    </li>
		    <li v-if="afterHide" class="page-item">
		      <button class="page-link" @click="finalPage()">
		        <span aria-hidden="true">&raquo;</span>
		      </button>
		    </li>
		  </ul>
		</nav>
	</div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
	totalData: {
		type: Number,
		default: 100
	},
	perPage: {
		type: Number,
		default: 10
	},
	showPageNum: {
		type: Number,
		default: 3
	},
	changePageYPosition: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['change-page'])

const route = useRoute()
const router = useRouter();

const currentPage = defineModel()

const totalPage = ref(5)
const beforeHide = ref(false)
const afterHide = ref(false)

const pages = computed(() => {
	totalPage.value = Math.ceil(props.totalData / props.perPage)
	beforeHide.value = false
	afterHide.value = false
	let start = currentPage.value - props.showPageNum
	if (start <= 1) start = 1
	else beforeHide.value = true
	let end = currentPage.value + props.showPageNum
	if (end >= totalPage.value) end = totalPage.value
	else afterHide.value = true
	let result = []
	for (let i=start; i<=end; i++) {
		result.push(i)
	}
	return result
})

async function changePage(i) {
	window.scrollTo(0, props.changePageYPosition)
	emit('change-page', i)
	currentPage.value = i
	router.push({ query: {
			...route.query,
			...{ page: i }
		}
	})
}
function isCurrentPage(i) {
	return (currentPage.value === i) ? true : false
}
function disableFirstPage() {
	return (currentPage.value === 1) ? true : false
}
function disableLastPage() {
	return (currentPage.value === totalPage) ? true : false
}
function firstPage() {
	changePage(1)
	emit('change-page', 1)
}
function nextPage() {
	let next = currentPage.value + 1
	changePage(next)
	emit('change-page', next)
}
function prevPage() {
	let prev = currentPage.value - 1
	changePage(prev)
	emit('change-page', prev)
}
function finalPage() {
	changePage(totalPage.value)
	emit('change-page', totalPage)
}
</script>

<style scope>
</style>