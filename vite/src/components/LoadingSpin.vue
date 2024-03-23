<template>
  <div class="wrap">
    <div class="loader"></div>
  </div>
</template>

<style lang="scss" scoped>

.wrap {
  width: 120px;
  height: 120px;
  border-radius: 5%;
  padding-top: 30px;
  padding-left: 30px;
  background-color: $gray-200;
}

[data-bs-theme="dark"] {
  .wrap {
    background-color: $gray-700;
  }
}

.loader {
  border: 6px solid #f3f3f3;
  border-radius: 50%;
  border-top: 6px solid #3498db;
  width: 60px;
  height: 60px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>