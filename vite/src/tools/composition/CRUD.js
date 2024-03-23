import { ref, reactive } from 'vue';
import { axios } from "@/tools/request";

export const updateListData = ref(false)

export default () => {

  // 常用共用

  const firstLoad = ref(true)
  const loading = ref(false)

  const modelName = ref('')
  const baseUrl = ref('')


  // 列表相關

  const currentPage = ref(1)
  const perPage = ref(10)
  const totalData = ref(0)

  const list = ref([])
  const queryObj = reactive({
    sortBy: 'id',
    orderBy: 'desc',
    limit: perPage.value,
    offset: perPage.value * (currentPage.value - 1),
  })

  function initQueryObj(obj) {
    for (const [key, value] of Object.entries(obj)) {
      queryObj[key] = value
    }
  }

  async function getList(params) {
    let response = {}
    try {
      response = await axios.get("/" + modelName.value, { params: params })
      list.value = response.data
    } catch(error) {
      console.log(error)
      throw error;
    }
  }

  async function getListCount(params) {
    let response = {}
    try {
      response = await axios.get("/" + modelName.value + "/count", { params: params })
      totalData.value = response.data.total
    } catch(error) {
      console.log(error)
      throw error
    }
  }

  async function deleteItem(itemId, params) {
    try {
      await axios.delete('/' + modelName.value + '/' + itemId, { params: params })
    } catch(error) {
      console.log(error)
      throw error
    }
  }


  // 項目表單相關

  const formValid = ref({ fails: false })
	function formValidFeild(feildName) {
		if (formValid.value.fails) {
      if (formValid.value.errors[feildName] === undefined) {
        return false
      } else return true
    } else return false
	}
	function formValidClear() {
		if (this.formValid.fails) {
    	formValid.value = {
        fails: false,
      }
  	}
	}


  const formMode = ref('new')
  const formData = ref({})

  function initFormData(obj) {
    for (const [key, value] of Object.entries(obj)) {
      formData.value[key] = value
    }
  }

  async function getItem(itemId, params) {
    let response = {}
    try {
      response = await axios.get("/" + modelName.value + "/" + itemId, { params: params })
      formData.value = response.data;
    } catch(error) {
      console.log(error)
      throw error
    }
  }

  async function newItem(params) {
    try {
      return await axios.post('/' + modelName.value, formData.value, { params: params })
    } catch(error) {
      if (error.response.status === 400) {
        formValid.value = {
          fails: true,
          errors: error.response.data.errors
        }
      }
      throw error
    }
  }

  async function editItem(itemId, params) {
    try {
      return await axios.put('/' + modelName.value + '/' + itemId, formData.value, { params: params })
    } catch(error) {
      if (error.response.status === 400) {
        formValid.value = {
          fails: true,
          errors: error.response.data.errors
        }
      }
      throw error
    }
  }

  async function saveItem(itemId, params) {
    let response = {}
    loading.value = true
    try {
      if (formMode.value === 'new') {
        response = await newItem(params)
      } else {
        response = await editItem(itemId, params)
      }
    } catch(error) {
      throw error
    }

    loading.value = false
    return response
  }

  return {
    firstLoad,
    loading,
    modelName,
    baseUrl,
    list,
    queryObj,
    currentPage,
    perPage,
    totalData,
    initQueryObj,
    getList,
    getListCount,
    deleteItem,
    formValid,
    formValidFeild,
    formValidClear,
    getItem,
    formMode,
    formData,
    initFormData,
    newItem,
    editItem,
    saveItem,
  }
}