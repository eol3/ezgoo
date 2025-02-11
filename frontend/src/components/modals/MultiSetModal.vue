<template>
	<div class="modal fade" id="multiSetModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">批次修改</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-html="$store.state.modal.text"></div>
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancel()">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="confirm()">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>