<template>
  <div class="d-flex justify-content-between pb-3">
    <div class="fs-5 fw-5 my-auto">貼文分類管理</div>
    <div>
      <a class="btn btn-outline-secondary btn-sm" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i>
        返回
      </a>
    </div>
  </div>
  <div class="row justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-8">
          <label class="form-label">
            <span v-if="formMode === 'new'">
              <i class="fa-solid fa-plus"></i>新增
            </span>
            <span v-if="formMode === 'edit'">
              <i class="fa-fw fa-solid fa-pen"></i>編輯
            </span>
            貼文分類
          </label>
          <div v-if="formMode === 'list'" class="mb-3">
            <button class="btn btn-outline-primary" @click="newCategory">新增貼文分類</button>
          </div>
          <div v-if="formMode === 'new' || formMode === 'edit'" class="input-group mb-3">
            <input type="text" class="form-control" v-model="formData.name" placeholder="請輸入貼文分類名稱">
            <button class="btn btn-outline-success" type="button" @click="save">
              儲存
            </button>
            <button v-if="formMode === 'edit'" class="btn btn-outline-danger" type="button" @click="deleteCategory">刪除</button>
            <button v-if="formMode === 'new' || formMode === 'edit'" class="btn btn-outline-secondary" type="button" @click="cancelEdit">取消</button>
          </div>
          <label v-if="formMode === 'new' || formMode === 'edit'" class="form-label">
            <template v-if="selectedStatus">
              已選擇上層分類「{{ selectedStatus }}」
            </template>
            <template v-else>
              請選擇上層分類
            </template>
          </label>
          <label v-else></label>
          <div class="category-wrap p-2 rounded-3">
          	<div v-if="list.length === 0">
          		尚無分類
          	</div>
            <template v-for="(item, key) in treeList" :key="key">
              <ItemOption
                :formMode="formMode"
                :children-category="item"
                :expand="true"
                @selected-item="selectedItem"
                @do-option="doOption"
              >
              </ItemOption>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
  <confirm-modal></confirm-modal>
</template>

<script setup>
import { onMounted, onActivated, ref, nextTick  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import CRUDTools from "@/tools/composition/CRUD";
import ItemOption from "@/components/category/ItemOption.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import { listToTree } from '@/tools/libs'

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { loading, baseUrl, storeId,
	modelName,
  initQueryObj, queryObj, list, getList,
  formData, defineFormData, formMode,
	formValid, formValidFeild, formValidClear,
  newItem, itemId, editItem, deleteItem } = CRUDTools()

modelName.value = 'post-category'
storeId.value = route.params.storeId
baseUrl.value = '/manage/store/' + storeId.value + '/' + modelName.value + '/'

const treeList = ref([])
const selectedStatus = ref(null)

formMode.value = 'list'

initQueryObj({
  status: 'all',
  sortBy: 'priority',
  orderBy: 'asc'
})

onMounted(async () => {
  defineFormData({
    name: '',
    parentId: null
  })
  getCategory()
})

onActivated(async () => {
  emit('updateLayoutStatus', {
    title: '貼文分類管理',
    showBack: true,
  })
})

async function getCategory() {
  return getList(queryObj).then(() => {
  	if (list.value.length === 0) return
    list.value.splice(0, 0, { id: 'root', name: 'root', parentId: null, children: null })
    for (const item of list.value) {
      item.active = false
    }
    treeList.value = listToTree(list.value)
  })
}

function selectedItem(item) {
  if (item.id === itemId.value) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '不能選擇移動到同一個分類'
    })
    return
  }
  
  if (item.active) {
    item.active = false
    selectedStatus.value = null
    formData.value.parentId = null
    item.subExpand = false
    item.hasExpand = false
    return
  }

  if (item.id === 'root') {
    clearActive(treeList.value)
    item.active = true
    selectedStatus.value = null
    formData.value.parentId = null
    return
  }
  
  clearActive(treeList.value)
  item.active = true
  item.subExpand = true
  item.hasExpand = true
  selectedStatus.value = item.name
  formData.value.parentId = item.id
}

function newCategory() {
  formMode.value = 'new'
  defineFormData({
    name: '',
    parentId: null
  })
}

async function save() {
  if (loading.value) return
  loading.value = true
  const newCategory = {
    id: '',
    name: formData.value.name,
    parentId: formData.value.parentId,
    children: null
  }
  if (formMode.value === 'new') {
    let response = await newItem()
    if (list.value.length === 0) {
      list.value.splice(0, 0, { id: 'root', name: 'root', parentId: null, children: null })
    }
    newCategory.id = response.data.id
    list.value.push(newCategory)
  } else if (formMode.value === 'edit') {
    await editItem()
    let editCategory = getTreeItem(treeList.value, itemId.value)
    editCategory.name = newCategory.name
    editCategory.parentId = newCategory.parentId
    formMode.value = 'list'
  }
  loading.value = false
  treeList.value = listToTree(list.value)
  defineFormData({
    name: '',
    parentId: null
  })
  clearActive(treeList.value)
  selectedStatus.value = null
}

function doOption(action, item) {
  switch (action) {
    case 'moveUp':
      moveUp(item)
    break;
    case 'moveDown':
      moveDown(item)
    break;
    case 'edit':
      editCategory(item)
      break;
  }
}

function editCategory(item) {
  window.scroll(0, 0)
  clearActive(treeList.value)
  
  formMode.value = 'edit'
  itemId.value = item.id
  formData.value.name = item.name
  formData.value.parentId = null
  delete formData.value.priority
  selectedStatus.value = null

  if (item.parentId) {
    const parent = getTreeItem(treeList.value, item.parentId)
    parent.active = true
    formData.value.parentId = parent.id
    selectedStatus.value = parent.name
  }
}

function cancelEdit() {
  formMode.value = 'list'
  itemId.value = null
  selectedStatus.value = null
  clearActive(treeList.value)
  defineFormData({
    name: '',
    parentId: null
  })
}

function deleteCategory() {
  store.commit('setModal', {
		show: true,
		text: "確認刪除貼文分類「" + formData.value.name + "」",
		confirmCallback: async () => {
			store.state.modal.loading = true
			await deleteItem()
      deleteListItem(list.value, itemId.value)
      treeList.value = listToTree(list.value)
			store.state.modal.show = false
      formMode.value = 'list'
			store.dispatch('showAlert', {
				type: 'success',
				text: '刪除成功'
			})
		}
	})
}

function moveUp(item) {
  let sameLevel = getSameLevel(list.value, item.parentId)
  for(let i in sameLevel) {
    if (sameLevel[i].id === item.id) {
      if (i === '0') {
        store.dispatch('showAlert', {
          type: 'warning',
          text: '已是同層級分類最上，無法往上移動'
        })
      } else {
        setTwoPriority(sameLevel[i], sameLevel[i-1])
      }
      break;
    }
  }
}

function moveDown(item) {
  let sameLevel = getSameLevel(list.value, item.parentId)
  let max = sameLevel.length -1
  for(let i in sameLevel) {
    if (sameLevel[i].id === item.id) {
      if (i == max) {
        store.dispatch('showAlert', {
          type: 'warning',
          text: '已是同層級分類最下，無法往下移動'
        })
      } else {
        setTwoPriority(sameLevel[i], sameLevel[Number(i)+1])
      }
      break;
    }
  }
}

async function setTwoPriority(item1, item2) {
  if (loading.value) return
  loading.value = true
  try {
    await Promise.all([
      setPriority(item1.id, item2.priority),
      setPriority(item2.id, item1.priority),
    ])
    await getCategory()
  } finally {
    loading.value = false
  }
}

async function setPriority(id, priority) {
  itemId.value = id
  defineFormData({ priority: priority })
  await editItem()
  itemId.value = null
}

function clearActive(tree) {
  for (const item of tree) {
    item.active = false
    if (item.children.length > 0) {
      clearActive(item.children)
    }
  }
}

function getTreeItem(tree, compareId) {
  var result
  for (const item of tree) {
    if (item.id === compareId) {
      return item
    } else if (item.children.length > 0) {
      result = getTreeItem(item.children, compareId)
      if (result) {
        return result;
      }
    }
  }
}

function deleteListItem(list, id) {
  for (const key in list) {
    if (list[key].id === id) {
      updateParentList(list[key].id, list[key].parentId)
      list.splice(key, 1)
    }
  }
}

function updateParentList(oldParentId, newParentId) {
  for (const item of list.value) {
    if (item.parentId === oldParentId) {
      item.parentId = newParentId
    }
  }
}

function getSameLevel(list, parentId) {
  let result = []
  for (const item of list) {
    if (item.parentId === parentId && item.id !== 'root') {
      result.push(item)
    }
  }
  return result
}

</script>

<style lang="scss" scoped>
.category-wrap {
  background-color: var(--d-gray-0);
}
</style>