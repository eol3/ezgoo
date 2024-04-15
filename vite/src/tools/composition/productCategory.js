import { ref, reactive } from 'vue';
import { axios } from "@/tools/requestCache";
import { listToTree } from '@/tools/libs'
import { useRoute, useRouter  } from "vue-router";

export default () => {
  const route = useRoute()
  const router = useRouter()
  const categoryIds = ref('')
  const categoryList = ref([])
  const treeList = ref([])
  const selectedCategories = ref([])
  const categoryQueryObj = reactive({
    storeId: null,
    status: 'all',
    sortBy: 'priority',
    orderBy: 'asc'
  })
  const isNeedChangeRoute = ref(false)

  async function getProductCategory() {
    return axios.get('/product-category/', {
      params: categoryQueryObj
    }).then((response) => {
      categoryList.value = response.data
      categoryList.value.splice(0, 0, { id: 'root', name: 'root', parentId: null, children: null })
      treeList.value = listToTree(categoryList.value)
    })
  }
  
  function selectedItem(item) {
    selectedCategories.value.push(item)
    setIds()
  }
  
  function unSelectedItem(item) {
    selectedCategories.value = selectedCategories.value.filter(function( obj ) {
  		return obj.id !== item.id;
  	});
    categoryList.value.forEach((obj) => {
      if (obj.id === item.id) {
        obj.active = false
      }
    })
    setIds()
  }

  function setIds() {
    let ids = ''
    for (const item of selectedCategories.value) {
      ids += item.id + '-'
    }
    ids = ids.slice(0, -1)
    categoryIds.value = ids
    if (isNeedChangeRoute.value) {
      changeRoute()
    }
  }

  function parseIds() {
    const ids = categoryIds.value.split('-')
    for (let i in ids) {
      ids[i] = Number(ids[i])
    }
    selectedCategories.value = []
    for (const item of categoryList.value) {
      if (ids.indexOf(item.id) > -1) {
        selectedCategories.value.push(item)
        item.active = true
      } else item.active = false
    }
  }

  function changeRoute() {
    const query = Object.assign({}, route.query);
    if (categoryIds.value === '') {
      delete query.categoris
    } else {
      query.categoris = categoryIds.value
    }
    if (query.page) delete query.page
    router.push({ query: query })
  }

  function setAndParseIds(ids) {
    if (!ids) {
      categoryIds.value = ''
      selectedCategories.value = []
    } else {
      categoryIds.value = ids
    }
    parseIds()
  }

  return {
    categoryIds,
    selectedCategories,
    categoryList,
    treeList,
    categoryQueryObj,
    isNeedChangeRoute,
    parseIds,
    setAndParseIds,
    changeRoute,
    getProductCategory,
    selectedItem,
    unSelectedItem
  }
}