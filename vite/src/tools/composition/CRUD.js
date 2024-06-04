import { ref, reactive } from 'vue';
// import { axios } from "@/tools/request";
import { axios } from "@/tools/requestCache";
import { useStore } from "vuex";

export default () => {

  const store = useStore()

  // 常用共用

  const firstLoad = ref(true)
  const loading = ref(false)

  const modelName = ref('')
  const baseUrl = ref('')
  const apiBaseUrl = ref('')
  const storeId = ref(null)
  const itemId = ref(null)

  // 列表相關

  const currentPage = ref(1)
  const perPage = ref(10)
  const totalData = ref(0)

  const list = ref([])
  const queryObj = reactive({})

  function initQueryObj(obj) {
    for (const [key, value] of Object.entries(obj)) {
      queryObj[key] = value
    }
  }

  async function getList(params) {
    let response = {}
    try {
      response = await axios.get(apiBaseUrl.value + "/" + modelName.value, {
        params: {
          ...{ storeId: storeId.value },
          ...params
        }
      })
      list.value = response.data
      return response
    } catch(error) {
      console.log(error)
      throw error;
    }
  }

  async function getListCount(params) {
    let response = {}
    try {
      response = await axios.get("/" + modelName.value + "/count", {
        params: {
          ...{ storeId: storeId.value },
          ...params
        }
      })
      totalData.value = response.data.total
    } catch(error) {
      console.log(error)
      throw error
    }
  }

  async function deleteItem(params) {
    try {
      await axios.delete(apiBaseUrl.value + '/' + modelName.value + '/' + itemId.value, {
        params: {
          ...{ storeId: storeId.value },
          ...params
        }
      })
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


  const formMode = ref('new') // edit
  const formData = ref({})

  function defineFormData(obj) {
    formData.value = obj
  }

  function setFormData(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (formData.value.hasOwnProperty(key)) formData.value[key] = value
    }
  }
  

  async function getItem(params) {
    let response = {}
    try {
      response = await axios.get(apiBaseUrl.value + "/" + modelName.value + "/" + itemId.value, {
        params: {
          ...{ storeId: storeId.value },
          ...params
        }
      })
      setFormData(response.data)
      return response
      // formData.value = response.data;
    } catch(error) {
      console.log(error)
      throw error
    }
  }

  async function newItem(params) {
    try {
      return await axios.post(apiBaseUrl.value + '/' + modelName.value, formData.value, {
        params: {
          ...{ storeId: storeId.value },
          ...params
        }
      })
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

  async function editItem(params) {
    try {
      return await axios.put(apiBaseUrl.value + '/' + modelName.value + '/' + itemId.value, formData.value, {
        params: {
          ...{ storeId: storeId.value },
          ...params
        }
      })
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

  async function saveItem(params) {
    let response = {}
    loading.value = true
    try {
      if (formMode.value === 'new') {
        response = await newItem(params)
      } else {
        response = await editItem(params)
      }
    } catch(error) {
      throw error
    }
    store.dispatch('clearCache')
    loading.value = false
    return response
  }

  return {
    firstLoad,
    loading,
    modelName,
    baseUrl,
    apiBaseUrl,
    storeId,
    list,
    queryObj,
    currentPage,
    perPage,
    totalData,
    initQueryObj,
    getList,
    getListCount,
    itemId,
    deleteItem,
    setFormData,
    formValid,
    formValidFeild,
    formValidClear,
    getItem,
    formMode,
    formData,
    defineFormData,
    newItem,
    editItem,
    saveItem,
  }
}