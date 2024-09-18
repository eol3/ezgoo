<template>
  <div class="bg-1">
    <div class="container">
      <div class="row justify-content-md-center py-3">
        <div class="col-12 col-lg-8 p-4 bg-0">
          <div class="row">
            <div class="col-12 col-md-8">
              <router-link v-if="storeInfo" :to="'/store/' + storeInfo.id" class="text-black text-decoration-none">
                <div class="d-flex flex-row">
                  <div class="mx-2 my-auto">
                    <img
                      v-if="storeInfo.thumbnail"
                      :src="storeInfo.thumbnail"
                      class="rounded-circle avatar-image"
                      width="60"
                    />
                    <div v-else class="no-image d-flex align-items-center justify-content-center bg-gray-200">
                      <i style="font-size: 12px;" v-if="storeInfo.thumbnail !== undefined">尚無圖片</i>
                    </div>
                  </div>
                  <div class="my-auto">
                    <div class="fs-5 fw-bold" style="word-wrap: break-word;">
                      {{ storeInfo.name }}
                    </div>
                  </div>
                </div>
              </router-link>
              <div v-else class="d-flex flex-row">
                <div class="mx-2 my-auto">
                  <div class="no-image d-flex align-items-center justify-content-center bg-gray-200">
                  </div>
                </div>
              </div>
              <div class="row-image-wrap d-flex align-items-center my-2" ref="rowImageWrap">
                <div v-for="(item, key) in postImages" :key="key">
                  <div>
                    <LoadingSpin
                      v-if="item.loading === true"
                      :width="320"
                      :height="320"
                      :borderRadius="'2%'"
                    ></LoadingSpin>
                    <div class="image-item d-flex align-items-center" v-else>
                      <img :src="item.baseUrl + item.path + '/' + item.filename"/>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {{ post.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import { axios } from "@/tools/requestCache";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import LoadingSpin from "@/components/LoadingSpin.vue";
import { setHead } from '@/tools/libs'

const store = useStore()
const route = useRoute()
const router = useRouter()

const storeInfo = ref(null)
const post = ref({
  name: '',
  price: 0,
  options: []
})

const queryObj = reactive({
  status: '1'
})
const postImages = ref([])
const rowImageWrap = ref(null)

if (route.query.storeId) {
  queryObj.storeId = route.query.storeId
}

if (store.state.preview) {
  delete queryObj.status
}

onMounted( async () => {
  window.scrollTo(0, 0)
  getPost()
  storeInfo.value = await store.dispatch('getCache', 'currentStore')
})

function getPost() {
  axios.get('/post/' + route.params.postId, {
    params: queryObj
  }).then((response) => {
    queryObj.storeId = response.data.storeId
    post.value = response.data
    setHead({
      title: post.value.content.length > 20 ? post.value.content.slice(0, 20) + '...' : post.value.content,
      description: post.value.content,
      image: post.value.thumbnail,
      url: document.URL
    })
    getStore()
    getPostImages()
  })
}

function getStore() {
  axios.get('/store/' + queryObj.storeId, {
    params: queryObj
  }).then((response) => {
    storeInfo.value = response.data
  })
}

function getPostImages() {
  axios.get('/post/' + route.params.postId + '/images', {
    params: queryObj
  }).then((response) => {
    postImages.value = response.data
  })
}
</script>

<style lang="scss" scoped>

.row-image-wrap {
	width: 100%;
	overflow-x: auto;
}

.image-item {
	width: 320px;
  height: 320px;
	overflow: hidden;
  margin: 0px 5px;
}

.image-item img {
	width: 100%;
}
</style>