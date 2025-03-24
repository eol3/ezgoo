<template>
	<div class="modal fade" id="scanBarcodeModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">掃描條碼</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-center mb-3">
            <div class="d-flex justify-content-center align-items-center camera-wrap">
              <div
                v-if="msg !== ''"
                @click="startCamera"
              >
                {{ msg }}
              </div>
              <video ref="videoRef" v-else class="video-preview" autoplay playsinline></video>
            </div>
          </div>
          <canvas ref="canvasRef" class="d-none"></canvas>
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
const msg = ref('')

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
  } catch (error) {
    if (error.name === "NotAllowedError") {
      msg.value = '請檢查相機權限設定，並允許存取。'
    } else if (error.name ===  'NotReadableError') {
      msg.value = '未找到相機。'
    } else {
      msg.value = error.name
    }
    console.log(error.name)
  }
  try {
    videoRef.value.srcObject = stream;
    videoRef.value.play();
    scanning = true;
    scanBarcode();
    
  } catch (err) {
    // msg.value = JSON.stringify(err, Object.getOwnPropertyNames(err))
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
    // msg.value = JSON.stringify(err, Object.getOwnPropertyNames(err))
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
  // msg.value = JSON.stringify(results)
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
.camera-wrap {
  width: 300px;
  height: 200px;
  background-color: black;
  color: white;
}
</style>