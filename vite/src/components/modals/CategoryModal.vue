<template>
	<div class="modal fade" :id="elementId" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">選擇商品分類</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <CategoryList
            :allCategories="allCategories"
            @selected-item="selectedItem"
            @unselected-item="unSelectedItem"
          >
          </CategoryList>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { onMounted, reactive  } from 'vue'
import CategoryList from "@/components/category/List.vue";

const props = defineProps({
	elementId: {
		type: String,
		default: 'cagetgoryModal'
	},
  allCategories: {
		type: Array,
		default: []
	},
})

const emit = defineEmits(['selected-item', 'unselected-item'])

let modal = reactive({})

onMounted(() => {
  var modalEl = document.getElementById(props.elementId)
  modal = new Modal(modalEl)
})

function selectedItem(item) {
  modal.hide()
  emit('selected-item', item)
}

function unSelectedItem(item) {
  modal.hide()
  emit('unselected-item', item)
}



// defineExpose({ setSelectedIds, setActiveByIds, asyncGetSelectedCategories })

// const { loading, storeId,
// 	modelName,
//   initQueryObj, queryObj, list, getList } = CRUDTools()

// const treeList = ref([])
// let modal = reactive({})
// const selectedIds = ref('')

// modelName.value = 'product-category'
// storeId.value = route.params.storeId

// initQueryObj({
//   status: 'all',
//   sortBy: 'priority',
//   orderBy: 'asc'
// })

// onMounted(() => {
//   var modalEl = document.getElementById(props.elementId)
//   modal = new Modal(modalEl)
//   modalEl.addEventListener('show.bs.modal', async () => {
//   })
// })

// onActivated(async () => {
//   getCategory()
// })

// async function getCategory() {
//   getList(queryObj).then(() => {
//     list.value.splice(0, 0, { id: 'root', name: 'root', parentId: null, children: null })
//     asyncGetSelectedCategories()
//     treeList.value = listToTree(list.value)
//   })
// }

// function selectedItem() {
//   modal.hide()
//   getSelectedCategories()
// }

// function unSelectedItem() {
//   modal.hide()
//   getSelectedCategories()
// }

// function getSelectedCategories() {
//   let seleted = []
//   for (const item of list.value) {
//     if (item.active) seleted.push(item)
//   }
//   emit('selected-item', seleted)
// }

// function asyncGetSelectedCategories() {
//   setActiveByIds(selectedIds.value)
//   let seleted = []
//   for (const item of list.value) {
//     if (item.active) seleted.push(item)
//   }
//   emit('noemit-selected-item', seleted)
// }

// function setSelectedIds(ids) {
//   selectedIds.value = ids
// }

// function setActiveByIds(ids) {
//   ids = ids.split('-')
//   for (let i in ids) {
//     ids[i] = Number(ids[i])
//   }
//   for (const item of list.value) {
//     if (ids.indexOf(item.id) > -1) {
//       item.active = true
//     } else item.active = false
//   }
// }

</script>