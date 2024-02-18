
import { ref, reactive, computed } from 'vue';
import { useStore } from "vuex";
import { useRoute } from "vue-router";

export const page = reactive({
  num: 1,
  size: 10,
  total: 1
})

export function setPageTotal(total) {
  page.total = Math.ceil(total / page.size)
}

export function changePage(pageNum) {
  page.num = pageNum
}