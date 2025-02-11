<template>
  <router-view/>
  <alert />
  <ConfirmModal />
</template>

<script setup>
import Alert from "@/components/Alert.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
</script>
