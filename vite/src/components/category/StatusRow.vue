<template>
  <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#cagetgoryModal">選擇分類</button>
  <span class="ms-1 d-flex align-items-center">
    <SeletedList
      :selectedCategories="selectedCategories"
      @unselected-item="selfUnSelectedItem"
    ></SeletedList>
  </span>
  <CategoryModal
		:allCategories="treeList"
		@selected-item="selfSelectedItem"
		@unselected-item="selfUnSelectedItem"
	></CategoryModal>
</template>

<script setup>
import { onMounted, onActivated, watch } from 'vue'
import CategoryModal from '@/components/modals/CategoryModal.vue';
import SeletedList from '@/components/category/SeletedList.vue';
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import productCategoryTools from "@/tools/composition/productCategory";

const route = useRoute()

const { selectedCategories, categoryIds, treeList, 
	isNeedChangeRoute, categoryQueryObj, setAndParseIds,
	getProductCategory, selectedItem, unSelectedItem } = productCategoryTools()

const parentCategoryIds = defineModel()
parentCategoryIds.value = categoryIds.value

const props = defineProps({
	relateQuery: {
		type: Boolean,
		default: false
	}
})

isNeedChangeRoute.value = props.relateQuery
categoryQueryObj.storeId = route.params.storeId

onMounted(() => {
	getProductCategory().then(() => {
		setAndParseIds(parentCategoryIds.value)
	})
})

watch(() => parentCategoryIds.value, (newVal) => {
	setAndParseIds(newVal)
})

function selfSelectedItem(item) {
	selectedItem(item)
	parentCategoryIds.value = categoryIds.value
}

function selfUnSelectedItem(item) {
	unSelectedItem(item)
	parentCategoryIds.value = categoryIds.value
}

</script>