<template>
  <div class="container py-4">
    <div class="p-5 mb-4 bg-body-tertiary rounded-3 align-content-center" style="height:400px;">
      <div class="row">
        <div class="col-12 col-lg-10 offset-lg-1">
          <h1 class="text-primary">EzGoo 易購網購物平台</h1>
          <p class="text-primary">簡單容易使用的購物平台</p>
          <button class="d-block my-2 btn btn-primary" @click="$router.push('/store/create')">立即建立商店</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-7 align-content-center">
        <h2 class="featurette-heading fw-normal lh-1">立即快速查看我們的
          <router-link to="/store/2" class="text-decoration-none">
            範例商店
          </router-link>
        </h2>
        <p class="lead">透過我們的範例商店，可以快速知道我們商店的樣式與功能</p>
      </div>
      <div class="col-md-5">
        <svg class="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto" width="500" height="500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 500x500" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="var(--bs-secondary-bg)"></rect><text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">500x500</text></svg>
      </div>
    </div>
    <div class="bg-1 my-5 py-4">
      <div class="fs-3 text-center py-3">
        Q & A
      </div>
      <div class="col-12 col-lg-10 offset-lg-1 p-4">
        <div class="accordion" id="accordionExample">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                Accordion Item #1
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Accordion Item #2
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                <strong>This is the second item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Accordion Item #3
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                <strong>This is the third item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="my-5 align-content-center" style="height: 200px;">
      <button class="d-block my-2 btn btn-primary mx-auto" @click="$router.push('/store/create')">立即建立商店</button>
    </div>
  </div>
</template>

<script setup>
window.scrollTo(0, 0)
</script>

<style lang="scss">
</style>