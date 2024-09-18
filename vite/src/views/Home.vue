<template>
  <div class="container py-4">
    <div class="row align-items-center mt-3">
      <div class="col-md-6 text-center">
        <div class="image-container">
          <img src="@/assets/images/herosection_img.png" width="100%" />
        </div>
      </div>
      <div class="col-md-6 mt-2">
        <h1 class="text-primary">
          EzGoo 易購網購物平台
        </h1>
        <p class="fs-4 fw-bold">一個帳號搞定所有商店，購物管理更輕鬆</p>
        <button class="d-block my-2 btn btn-primary" @click="$router.push('/store/create')">立即建立商店</button>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="row">
      <div class="col-md-4 text-center mb-4 mb-md-0">
        <img class="feature-icon" src="@/assets/images/Icon_1.png" />
        <h4 class="fw-bold">一站式跨店購物</h4>
        <p class="px-xl-4">
          消費者可於EzGoo 平台上的多家商店購物，享受便利和多樣選擇
        </p>
      </div>
      <div class="col-md-4 text-center">
        <img class="feature-icon" src="@/assets/images/Icon_2.png" />
        <h4 class="fw-bold">多店管理</h4>
        <p class="px-xl-4">
          單一帳號，管理多店，自由切換您的角色，輕鬆掌控全局，讓營運更高效、更省心
        </p>
      </div>
      <div class="col-md-4 text-center">
        <img class="feature-icon" src="@/assets/images/Icon_3.png" />
        <h4 class="fw-bold">協同營運</h4>
        <p class="px-xl-4">
          一個商店支援多個帳號無縫協作功能，運營效率大幅提升，合作順暢無阻，團隊配合無間
        </p>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="row mb-3 text-center">
      <h4 class="fw-bold">近期案例</h4>
    </div>
    <div class="row justify-content-md-center mb-3">
      <div class="col col-lg-8 d-lg-flex justify-content-center">
        <div class="d-flex flex-nowrap overflow-x-auto mx-1">
          <div class="store-card card flex-shrink-0 m-2" style="width: 18rem;">
            <router-link to="/store/2" class="text-decoration-none">
              <img src="@/assets/images/cover_1.png" class="card-img-top">
            </router-link>
            <div class="card-body">
              <router-link to="/store/2" class="text-black text-decoration-none">
                <h5 class="card-title fw-bold">愛之森生活用品館(範例商店)</h5>
                <p class="card-text">提倡環保用具(目前僅為範例商店，展示用不能下單)</p>
              </router-link>
            </div>
          </div>
          <div class="store-card card flex-shrink-0 m-2" style="width: 18rem;">
            <router-link to="/store/3" class="text-decoration-none">
              <img src="@/assets/images/cover_2.png" class="card-img-top">
            </router-link>
            <div class="card-body">
              <router-link to="/store/3" class="text-black text-decoration-none">
                <h5 class="card-title fw-bold">易購商福利量販店</h5>
                <p class="card-text">提供五金百貨、零食飲料、五穀雜糧等多項零售</p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="row">
      <div class="col-12 bg-image">
        <div class="content d-flex align-items-center justify-content-center">
          <div>
            <h4 class="fw-bold">加入EzGoo，享受智慧購物與高效管理的全新體驗</h4>
            <div class="d-flex align-items-center justify-content-center">
              <button class="d-block my-2 btn btn-primary" @click="$router.push('/store/create')">立即建立商店</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="my-5 py-4">
      <div class="fs-3 text-center py-3">
        Q & A
      </div>
      <div class="col-12 col-lg-10 offset-lg-1 p-4">
        <div class="accordion" id="accordionExample">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                需收費嗎？
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                目前免費，需收費的時候會發e-mail通知
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                是否串接第三方金流、物流？
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                目前沒有串接任何第三方，未來會規劃串接
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-line"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { setHead } from '@/tools/libs'

onMounted(() => {
  setHead({})
})

window.scrollTo(0, 0)
</script>

<style lang="scss">

.image-container {
  width: 100%;
  aspect-ratio: 94 / 65;
}

.section-line {
  height: 10rem;
}

.feature-icon {
  width: 30%;
  margin-bottom: 10px;
}
@include media-breakpoint-down(md) {
  .section-line {
    height: 5rem;
  }
}

.store-card {
  border: 1px solid #ebd5f0;
  box-shadow: #ebd5f0 0px 1px 2px 0px, #f5e8f6 0px 2px 6px 2px;
}

.bg-image {
  background-image: url("@/assets/images/startup-small-business-entrepreneur-sme-asian-woman-receive-order-phone-portrait-young-asian-small-business-owner-home-office-online-sell-marketing-delivery-sme-ecommerce-telemarketing-concept.jpg");
  position: relative;
  /* Full height */
  height: 70vh; 
  
  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
.bg-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}
.content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: black; /* 調整文字顏色 */
  width: 100%;
  height: 100%;
}
@include media-breakpoint-down(lg) {
  .bg-image {
    height: 40vh;
  }
}
</style>