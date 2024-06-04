<template>
  <div class="wrap" :style="customWrapStyle">
    <div class="loader"></div>
  </div>
</template>

<script setup>
import { reactive  } from 'vue'

const props = defineProps({
	width: {
		type: Number,
		default: 120
	},
  height: {
		type: Number,
		default: 120
	},
  borderRadius: {
		type: String,
		default: '5%'
	},
})

const customWrapStyle = reactive({
  width: props.width + 'px',
  height: props.height + 'px',
  'padding-top': (props.width - 60 ) / 2 + 'px',
  'padding-left': (props.height - 60 ) / 2 + 'px',
  'border-radius': props.borderRadius
})
</script>

<style lang="scss" scoped>

.wrap {
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