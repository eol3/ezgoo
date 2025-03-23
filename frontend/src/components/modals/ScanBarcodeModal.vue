<template>
	<div class="modal fade" id="scanBarcodeModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">掃描條碼</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-center">
            <video ref="videoRef" class="video-preview" autoplay playsinline></video>
          </div>
          <canvas ref="canvasRef" class="d-none"></canvas>
          <!-- <p>{{ log }}</p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { onMounted, ref, reactive  } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { readBarcodes } from "zxing-wasm";

let modal = reactive({})
const videoRef = ref(null);
const canvasRef = ref(null);
let stream = null;
let scanning = false;
// const log = ref('')

const emit = defineEmits(['detectedBarcode'])

onMounted(async () => {
  var modalEl = document.getElementById('scanBarcodeModal')
  modal = new Modal(modalEl)
  
  modalEl.addEventListener('show.bs.modal', () => {
    startCamera()
  })
  modalEl.addEventListener('hidden.bs.modal', () => {
    stopCamera()
  })
})

onBeforeRouteLeave(() => {
  modal.hide()
})

// 取得相機畫面
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoRef.value.srcObject = stream;
    videoRef.value.play();
    scanning = true;
    scanBarcode();
    
  } catch (err) {
    // log.value = JSON.stringify(err, Object.getOwnPropertyNames(err))
  }
}

// 掃描條碼
async function scanBarcode() {
  if (!scanning || !videoRef.value) return;
  
  const video = videoRef.value;
  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    requestAnimationFrame(scanBarcode);
    return;
  }

  const imageData = captureCamera()
  try {
    detect(imageData)
  }  catch (err) {
    // log.value = JSON.stringify(err, Object.getOwnPropertyNames(err))
  }
  requestAnimationFrame(scanBarcode);
}

function captureCamera() {
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return imageData
}

async function detect(source) {
  const results = await readBarcodes(source, {
    tryHarder: true,
    formats: ["EAN-13", "Code128", "Code39"],
    maxNumberOfSymbols: 1,
  });
  // log.value = JSON.stringify(results)
  if (results.length > 0) {
    stopCamera()
    emit('detectedBarcode', results[0].text)
    modal.hide()
  }
}

// 停止相機
function stopCamera() {
  scanning = false;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

</script>

<style scoped>
.video-preview {
  width: 300px;
  height: 200px;
  object-fit: cover; /* 確保畫面不變形 */
}
</style>