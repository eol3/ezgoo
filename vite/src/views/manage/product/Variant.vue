<template>
  <div class="row mt-3 justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          aaa
          <div class="form-group mt-2">
            <label class="form-label">售價</label>
            <input type="number" class="form-control" v-model="formData.price" @focus="formValidClear()" :disabled="loading">
            <div class="form-text text-danger">
              {{ formValidFeild('price') ? formValid.errors.price[0] : '' }}
            </div>
          </div>
          <div class="form-group mt-2">
            <label class="form-label">數量</label>
            <input type="number" class="form-control" v-model="formData.number" :disabled="loading">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onActivated, ref  } from 'vue'
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";

const emit = defineEmits(['updateLayoutStatus'])

const { loading, baseUrl, storeId, itemId,
	modelName, formMode, formData, defineFormData,
	formValid, formValidFeild, formValidClear,
	getItem, saveItem } = CRUDTools()

onActivated(async () => {
  emit('updateLayoutStatus', {
    title: '設定商品選項對應商品',
    showBack: true,
  })
})


</script>