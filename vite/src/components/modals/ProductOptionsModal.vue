<template>
	<div class="modal fade" id="productOptionsModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">設定商品選項</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-for="(item, pkey) in options">
            <div class="input-group mb-2">
              <input type="text" class="form-control" v-model="item.name" :disabled="loading" :placeholder="pkey === 0 ? 'Ex: 顏色' : ''"/>
              <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="delOption(pkey)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <div class="ms-4">
              <div v-for="(value, key) in item.values" :key="key" class="input-group mb-2">
                <input type="text" class="form-control" v-model="item.values[key]" :disabled="loading" :placeholder="pkey === 0 ? placeholderExText[key] : ''"/>
                <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="delSubOption(pkey, key)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <div class="my-2">
                <button class="btn btn-outline-primary btn-sm" @click="newSubOption(pkey)">新增子項目</button>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <button class="btn btn-outline-primary" @click="newOption">新增商品選項</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="confirm()" :disabled="loading">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { Modal } from 'bootstrap'
import { onMounted, reactive, ref  } from 'vue'
import { axios } from "@/tools/requestCache";

const store = useStore()
const route = useRoute()

const props = defineProps({
  productId: {
		type: String,
		default: ''
	},
})

const emit = defineEmits(['needNewItem', 'selectedOptions', 'hasDelVariantImage'])
defineExpose({ setParentOptions })

let modal = reactive({})
const loading = ref(false)
const options = ref([{
  name: '',
  values: ['','', '']
}])
const placeholderExText = ref(['紅', '藍', '綠'])
const productVaraint = ref([])

onMounted(() => {
  var modalEl = document.getElementById('productOptionsModal')
  modal = new Modal(modalEl)
})

function confirm() {
  if (!checkOptions()) return
  loading.value = true
  if (!props.productId) {
    emit('needNewItem', setOptions)  
  } else {
    setOptions()
  }
  compareVariant()
}

function checkOptions() {
  
  let nameArr = options.value.map(e => e.name)
  if (nameArr.some(e => e === '')) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '尚有選項未填寫'
    })
    return false
  }
  if (hasDuplicates(nameArr)) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '選項不能相同'
    })
    return false
  }
  
  let childArr = []
  options.value.forEach(e => e.values.forEach(c => childArr.push(c)))
  if (childArr.some(e => e === '')) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '尚有子選項未填寫'
    })
    return false
  }
  if (hasDuplicates(childArr)) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '子選項不能相同'
    })
    return false
  }
  
  return true
}

function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}


async function getProductVaraint() {
  return axios.get("/product/" + props.productId + "/variant", {
    params: { storeId: route.params.storeId }
  }).then((response) => {
    productVaraint.value = response.data
    for (const variant of productVaraint.value) {
      variant.productOption = JSON.parse(variant.productOption)
    }
  })
}

async function setProductVariant(option, variantId) {
  return axios.put("/product/" + props.productId + "/variant/" + variantId, {
    productOption: option
  }, {
    params: { storeId: route.params.storeId }
  }).then((response) => {
    productVaraint.value = response.data
  })
}

async function delProductVariant(variantId) {
  return axios.delete("/product/" + props.productId + "/variant/" + variantId, {
    params: { storeId: route.params.storeId }
  })
}

async function compareVariant() {
  await getProductVaraint()
  for (const variant of productVaraint.value) {
    // let option = JSON.parse(variant.productOption)
    let option = variant.productOption
    for (let i in option) {
      if (option[i] ===  null) continue
      if (!compareOptions(option[i])) {
        option[i] = null
        if (isAllNull(option) || isSameInAllVariant(option)) {
          await delProductVariant(variant.id)
          emit('hasDelVariantImage')
        } else {
          await setProductVariant(option, variant.id)
        }
      }
    }
  }
}

function compareOptions(compareValue) {
  for (const item of options.value) {
    for (const value of item.values) {
      if (value === compareValue) return true
    }
  }
  return false
}

function isSame(array1, array2) {
	if (!array1) return false
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

function isAllNull(option) {
	return isSame(option, [null, null, null])
}

function isSameInAllVariant(option) {
  const found = productVaraint.value.find(e => isSame(e.productOption, option))
  return found
}

async function setOptions() {
  axios.put('/product/' + props.productId, {
    options: options.value
  }, {
    params: { storeId: route.params.storeId }
  }).then(() => {
    emit('selectedOptions', options.value)
    modal.hide()
  }).finally(() => {
    loading.value = false
  })
}

function setParentOptions(parentOptions) {
  options.value = JSON.parse(JSON.stringify(parentOptions))
}

function newSubOption(pkey) {
  options.value[pkey].values.push('')
}

function delSubOption(pkey, key) {
  if (pkey === 0) {
    placeholderExText.value.splice(key, 1)
  }
  options.value[pkey].values.splice(key, 1)
}

function newOption() {
  if (options.value.length >= 3) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '商品選項不能超過3層'
    })
    return false
  }
  options.value.push({
    name: '',
    values: ['','', '']
  })
}

function delOption(pkey) {
  options.value.splice(pkey, 1)
}

</script>