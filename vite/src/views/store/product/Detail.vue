<template>
  <h5>product detail: {{ product.name }}</h5>
  
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { axios } from "@/tools/request";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

const store = useStore()
const route = useRoute()
const router = useRouter()

const product = ref({})
const queryObj = reactive({
  status: '1'
})

if (route.query.storeId) {
  queryObj.storeId = route.query.storeId
}

if (route.query.preview) {
  delete queryObj.status
}

onMounted( async () => {
  let response = {}
  try {
    response = await axios.get("/product/" + route.params.productId, { params: queryObj })
    product.value = response.data;
  } catch(error) {
    console.log(error)
    throw error
  }
})
</script>