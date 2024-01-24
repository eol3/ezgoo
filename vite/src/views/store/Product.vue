<template>
  <div class="row">
    <div class="col-md-2 pt-3">
      <category-list
        :mode="'link'"
        :base-url="'/store/' + $route.params.store_id + '/product'"
        @click-item="clickItem"
      ></category-list>
    </div>
    <div class="col-md-10 p-3">
      <product-list :product="product"></product-list>
      <div v-show="showMore" class="col-12 my-2 text-center">
        <div class="div-link" @click="more">
          查看更多
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import no_image_sm from '@/assets/no-image-sm.webp'
import ProductList from "@/components/ProductList.vue";
import CategoryList from "@/components/category/List.vue";

export default {
  name: "product",
  components: {
    CategoryList,
    ProductList
  },
  // computed: {
  //   allCategory () {
  //     return this.$store.state.categories;
  //   }
  // },
  data() {
    return {
      product: [],
      queryString: '',
      queryProductObj: {},
      showMore: false
    };
  },
  async created() {
    this.queryString = this.$route.fullPath.replace(this.$route.path, '')
    this.initProduct()
    this.initQueryProductObj()
    if (this.$route.query.categories === undefined) {
      this.getList()
    }
  },
  methods: {
    initProduct() {
      for (let i = 0;i < 8; i++) {
        this.product[i] = {
          name: "",
          price: null,
          spec: null,
          spec_price: 0,
          thumbnail: no_image_sm
        }
      }
    },
    initQueryProductObj() {
      this.queryProductObj = {
        page_size: 8,
        page_num: 1
      }
    },
    clickItem(obj) {
      if (obj.categoryId !== 'all' && obj.categorySubId !== '') {
        this.queryProductObj.categories = obj.categorySubId
      } else {
        delete this.queryProductObj.categories
      }
      this.getList(false)
    },
    more() {
      this.queryProductObj.page_num += 1;
      this.getList(true)
    },
    getList(addMode) {
			this.axios
        .get("/store/" + this.$route.params.store_id + "/product", {
          params: this.queryProductObj
        })
        .then(response => {
          if (addMode) {
            this.product.push(...response.data.data);
          } else {
            this.product = response.data.data;
          }
          if (this.product.length < response.data.page.total) {
            this.showMore = true;
          } else {
            this.showMore = false;
          }
        });
    }
  },
  watch: {
    '$route.query': function(to, from) {
      if (this.$route.name !== 'product') {
        // 不在商品頁時，不做任何動作
        return
      }
      let toQueryString = this.$route.fullPath.replace(this.$route.path, '')
      if (toQueryString === this.queryString) return
      this.queryString = toQueryString
      this.initProduct()
      this.initQueryProductObj()
      // this.getList()
    },
  }
};
</script>
