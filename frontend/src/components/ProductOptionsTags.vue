<template>
  <div v-for="(pItem, pKey) in productOptions" :key="pKey" class="mb-1">
    <span class="fw-bold">{{ pItem.name }}</span>
    <div>
      <button
        class="mx-1 my-1 btn btn-outline-secondary btn-sm product-option-btn"
        :class="{ active: selectedOptions.indexOf(item) > -1 }"
        :disabled="!findOptionInVariant(pKey, item)"
        v-for="(item, key) in pItem.values"
        :key="key"
        @click="clickOption(pKey, item)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { compareArraysWithRules } from '@/tools/libs'

const { productOptions, proudctVariant } = defineProps(['productOptions', 'proudctVariant'])

const selectedOptions = defineModel('selectedOptions')
const selectedProductVariant = defineModel('selectedProductVariant')

const emit = defineEmits(['onClickOption'])

function clickOption(pKye, item) {
  if (selectedOptions.value[pKye] === item) {
    selectedOptions.value[pKye] = null
  } else {
    selectedOptions.value[pKye] = item
  }
  const found = proudctVariant.find(e => isSame(e.productOption, selectedOptions.value))
  
  if (found) {
    let variantObj = {
      id: found.id,
      price: found.price,
    }
    if (found.barcode !== '') {
      variantObj.barcode = found.barcode
    }
    selectedProductVariant.value = variantObj
  } else {
    selectedProductVariant.value = false
  }
  emit('onClickOption')
}

function isSame(array1, array2) {
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

function findOptionInVariant(pKey, findItem) {
  let check = false
  let compareArray = [null, null, null]
  compareArray[pKey] = findItem
  let rules = ["ignore", "ignore", "ignore"]
  rules[pKey] = 'exact'
  for (let i in selectedOptions.value) {
    if (selectedOptions.value[i] && !compareArray[i]) {
      compareArray[i] = selectedOptions.value[i]
      rules[i] = 'exact'
    }
  }

  for (const item of proudctVariant) {
    if (compareArraysWithRules(item.productOption, compareArray, rules)) {
      check = true
      break;
    }
  }
  return check
}
</script>

<style lang="scss" scoped>
.product-option-btn:hover {
  color: #c53084;
  background-color: #fff;
  border-color: #c53084;
}
.product-option-btn.active {
  color: #fff;
  background-color: #c53084;
  border-color: #c53084;
}

.product-option-btn:active {
  color: #fff !important;
  background-color: #c53084 !important;
  border-color: #c53084 !important;
}

.product-option-btn:focus-visible {
  color: #fff;
  background-color: #c53084;
  border-color: #c53084;
  box-shadow: none;
}
</style>