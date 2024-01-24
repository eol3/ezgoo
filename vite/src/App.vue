<template>
  <router-view/>
  <alert />
</template>

<script>
import Alert from "@/components/Alert.vue";

export default {
  components: {
    Alert
  },
}
</script>