<template>
  <div class="container pt-3">
    <div class="row">
      <div class="col-12 col-md-6 offset-md-1 custom-padding">
        <div id="carouselProductControls" class="carousel slide" data-ride="carousel">
          <div class="carousel-inner">
            <template v-for="(item, key) in product_image" :key="key">
              <div :class="['carousel-item', {'active': (key === 0)} ]">
                <img class="d-block w-100" :src="item.url" alt="First slide">
              </div>
            </template>
          </div>
          <div v-show="product_image.length > 1">
            <a class="carousel-control-prev" href="#carouselProductControls" role="button" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselProductControls" role="button" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>
        <div class="d-flex justify-content-start overflow-auto pt-2">
          <template v-for="(item, key) in product_image" :key="key">
            <div class="mx-1" @click="selectImage(key)">
              <img width="100" :src="item.url" />
            </div>
          </template>
        </div>
      </div>
      <div class="col-12 col-md-4 my-2">
        <h5 class="text-gray-800">
          {{ product.name }}
        </h5>
        <div class="row">
          <div class="col text-right">
            <like-button :item="product"></like-button>
            <img
              @click="copyURLtoClipboard"
              width="24"
              src="@/assets/icons/share.png"
            />
          </div>
        </div>
        <hr />
        <div class="row">
          <div class="col-3 col-lg-3">
            價格:
          </div>
          <div class="col-9 col-lg-9">
            <template v-if="product.spec_price === 0">
              ${{ product.price }}
            </template>
            <template v-else>
              <span style="text-decoration:line-through;">
                ${{ product.price }}
              </span>
              <span style="color:red"> ${{ product.spec_price }} </span>
            </template>
          </div>
        </div>
        <div class="row py-1">
          <div class="col-3 col-md-3">
            數量:
          </div>
          <div class="col-9 col-md-9">
            <img
              width="24"
              @click="subtract"
              class="cursor-pointer ml-2"
              src="@/assets/icons/minus.png"
            />
            {{ number }}
            <img
              width="24"
              @click="add"
              class="cursor-pointer mr-2"
              src="@/assets/icons/add.png"
            />
          </div>
        </div>
        <div class="row" v-for="(item, key) in product.spec" :key="key">
          <div class="col-3 col-md-3">
            {{ item.name }}
          </div>
          <div class="col-9 col-md-9">
            <div
              class="form-check form-check-inline"
              v-for="(sub_item, sub_key) in item.content"
              :key="sub_key"
            >
              <input
                class="form-check-input"
                :name="key"
                type="radio"
                :id="sub_item.name"
                :value="sub_item.name"
                v-model="item.select_name"
              />
              <label class="form-check-label" :for="sub_item.name">
                {{ sub_item.name }}
              </label>
            </div>
          </div>
        </div>
        <br />
        <div class="row">
          <div class="col">
            <button class="btn btn-outline-secondary mx-1" @click="$router.go(-1)">
              <i class="fas fa-arrow-circle-left"></i>
              返回
            </button>
            <button
              @click="add_cart"
              class="btn btn-outline-primary mx-1"
              style="width:50%;"
            >
              <i class="fas fa-shopping-cart"></i>
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
    <br /><br /><br />
  </div>
</template>

<script>
// import back from "@/assets/icons/back.png";
// import cart from "@/assets/icons/cart_black.jpg";
import no_image_sm from '@/assets/no-image-sm.webp'
import LikeButton from "@/components/LikeButton.vue";
import * as bootstrap from 'bootstrap'
// import VueSlickCarousel from 'vue-slick-carousel';
// import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';
// import $ from 'jquery';
// import 'slick-carousel';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';


export default {
  name: "ProductItem",
  components: {
    LikeButton,
    // VueSlickCarousel
  },
  data() {
    return {
      product: {
        name: '',
        price: 0,
        spec_price: 0,
        spec: []
      },
      product_image: [{url: no_image_sm}],
      number: 1,
      carousel: {}
    };
  },
  beforeCreate() {
    // window.scrollTo(0,0);
  },
  created() {
    this.getProduct();
  },
  mounted() {
    var myCarousel = document.querySelector('#carouselProductControls')
    this.carousel = new bootstrap.Carousel(myCarousel, {
      interval: 0,
      touch: true,
      wrap: true
    })
  },
  methods: {
    async getProduct() {
      if (this.$route.params.product_name !== undefined) {
        this.product.name = this.$route.params.product_name
        this.product.price = this.$route.params.product_price
        this.product_image = [{ url: this.$route.params.product_thumbnail }]
      }
      this.axios
        .get("/store/ignore/product/" + this.$route.params.product_id)
        .then(async response => {
          this.product = response.data;
          this.product_image = response.data.images;
        });
    },
    set_meta() {
      this.$store.state.brand = {
        avatar: this.$store.state.store.avatar.url,
        name: this.$store.state.store.name,
        url: "/store/" + this.$store.state.store.account,
        show_prev: true
      };
      this.$store.state.meta.title =
        this.product.name + " - " + this.$store.state.store.name;
      this.$store.state.meta.describe = this.product.describe;
    },
    init_spec_check() {
      for (let i in this.product.spec) {
        let obj = this.product.spec[i].content;
        for (let j in obj) {
          obj[j].check = false;
        }
      }
    },
    copyURLtoClipboard() {
      var dummy = document.createElement("input"),
        text = window.location.href;

      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      this.$store.commit("set_alert", {
        type: "success",
        text: "網址已複製:" + window.location.href
      });
    },
    add() {
      this.number += 1;
    },
    subtract() {
      if (this.number <= 1) return;
      this.number -= 1;
    },
    add_cart() {
      let select_spec_obj = [];
      for (let i in this.product.spec) {
        if (this.product.spec[i].select_name === undefined) {
          this.$store.commit("set_alert", {
            type: "warning",
            text: this.product.spec[i].name + " 尚未選取"
          });
          return;
        } else {
          select_spec_obj.push({
            key: this.product.spec[i].name,
            name: this.product.spec[i].select_name
          });
        }
      }
      let obj = {
        id: this.product.id,
        store_id: this.product.store_id,
        name: this.product.name,
        spec: select_spec_obj,
        price: this.product.price,
        spec_price: this.product.spec_price,
        number: this.number,
        thumbnail: this.product.thumbnail
      };
      this.$store.dispatch("set_cart", obj);
    },
    selectImage(key) {
      this.carousel.to(key)
    }
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/custom.scss';

.custom-padding {
  padding: 0 3%;
}

#carouselProductControls {
  /*padding: 0 12%;*/
}

/*#carouselProductControls .carousel-item img {
  max-height: 400px;
}*/

#carouselProductControls .carousel-control-prev-icon,
#carouselProductControls .carousel-control-next-icon{
  background-color: $gray-500;
  border-radius: 50px;
}

@include media-breakpoint-down(md) {
  .custom-padding {
    padding: 0 0;
  }
  #carouselProductControls {
    padding: 0 0;
  }
}
</style>