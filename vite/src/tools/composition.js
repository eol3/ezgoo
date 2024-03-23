
import { ref } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { axios } from "@/tools/request";

export const firstLoad = ref(true)
export const loading = ref(false)

export const currentPage = ref(1)
export const perPage = ref(10)
export const totalData = ref(0)

export const listTools = function () {
  const test = ref(true)
  return {
    test
  }
}