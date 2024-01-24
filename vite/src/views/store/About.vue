<template>
  <div class="row pt-3 mx-3">
    <div class="card">
      <div class="card-body">
        <div class="form-group row mt-2">
          <label class="col-sm-2">關於我們:</label>
          <div class="col-sm-10">
            {{ $store.state.store.about }}
          </div>
        </div>
        <div class="form-group row mt-2">
          <label class="col-sm-2">公告:</label>
          <div class="col-sm-10">
            {{ $store.state.store.announcement }}
          </div>
        </div>
        <div class="form-group row mt-2">
          <label class="col-sm-2">地址:</label>
          <div class="col-sm-10">
            {{ $store.state.store.address }}
          </div>
        </div>
        <div class="form-group row mt-2">
          <label class="col-sm-2">電話:</label>
          <div class="col-sm-10">
            {{ $store.state.store.tel }}
          </div>
        </div>
        <div class="form-group row mt-2">
          <label class="col-sm-2">Facebook:</label>
          <div class="col-sm-10">
            {{ $store.state.store.fb_url }}
          </div>
        </div>
        <div class="form-group row mt-2">
          <label class="col-sm-2">Line:</label>
          <div class="col-sm-10">
            {{ $store.state.store.line_url }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <br /><br />
</template>

<script>
export default {
};
</script>
