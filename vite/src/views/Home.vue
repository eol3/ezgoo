<template>
  <div id="carouselControls" class="carousel slide" data-ride="carousel">
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#carouselControls" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
      <button type="button" data-bs-target="#carouselControls" data-bs-slide-to="1" aria-label="Slide 2"></button>
      <button type="button" data-bs-target="#carouselControls" data-bs-slide-to="2" aria-label="Slide 3"></button>
    </div>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <div class="carousel-caption d-none d-md-block">hello1</div>
      </div>
      <div class="carousel-item">
        <div class="carousel-caption d-none d-md-block">hello2</div>
      </div>
      <div class="carousel-item">
        <div class="carousel-caption d-none d-md-block">hello3</div>
      </div>
    </div>
    <a class="carousel-control-prev" href="#carouselControls" role="button" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only"></span>
    </a>
    <a class="carousel-control-next" href="#carouselControls" role="button" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only"></span>
    </a>
  </div>
  <div class="container">
    <h1>EzGOO 易購網路購物平台</h1>
    <h4>特色</h4>
    <ul>
      <li>
        一個帳號在多個商店購買各種商品或服務，並能選擇追蹤或成為會員
      </li>
      <li>
        一個帳號可開設管理多個商店，在不同商店有不同身分(擁有者、編輯、理貨員)
      </li>
      <li>
        一個商店也能加入不同帳號成為不同身分(擁有者、編輯、理貨員)，進行協同作業
      </li>
    </ul>
    <h4>目前商家</h4>
    <ul>
      <li>
        <router-link class="d-block py-2 px-2 text-decoration-none" to="/store/easybuy">
          易購商福利量販店
        </router-link>
      </li>
      <li>
        <router-link class="d-block py-2 px-2 text-decoration-none" to="/store/example">
          愛之森生活用品館(範例商店)
        </router-link>
      </li>
      <li>
        <router-link class="d-block py-2 px-2 text-decoration-none" to="/store/system">
          EzGOO系統管理中心
        </router-link>
      </li>
      <li>
        <router-link class="btn btn-primary" to="/store/create">立即建立商店</router-link>
      </li>
      <li>
        <button class="btn btn-primary" @click="test()">test</button>
      </li>
    </ul>
  </div>
</template>

<script>
// import { onMounted } from "vue";
// import $ from 'jquery';
// import carousel from '@/assets/carousel.png'
import * as bootstrap from 'bootstrap'

export default {
  name: 'Home',
  setup() {
    // onMounted(() => {
    //     $('.carousel').carousel('pause')
    //   })
    // setTimeout(() => {
    //   $('.carousel').carousel('pause')
    // }, 1000)
  },
  data() {
    return {
      carousel: {}
    }
  },
  mounted() {
    var myCarousel = document.querySelector('#carouselControls')
    myCarousel.addEventListener('slide.bs.carousel', function () {
      console.log('ok')
    })
    new bootstrap.Carousel(myCarousel, {
      interval: 0,
      wrap: false
    })
    // carousel.to(1)
  },
  methods: {
    test() {
      this.$store.dispatch('showAlert', {
				type: 'danger',
      	text: 'test'
			})
    }
  }
}
</script>

<style lang="scss">
#carouselControls {
  background: linear-gradient(to right, #f0047f, #6b0272);
}
#carouselControls .carousel-item {
  height: 280px;
}

</style>