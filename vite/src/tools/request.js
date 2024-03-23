import router from "../router/index";
import store from "../store/index";
import axios from "axios";

// import { setupCache } from 'axios-cache-adapter'

// const cache = setupCache({
//   maxAge: 15 * 60 * 1000,
//   exclude: {
//     query: false,
//     methods: ['put', 'patch', 'delete']
//   },
//   invalidate: async (config, request) => {
//     if (request.clearCacheEntry) {
//       await config.store.removeItem(config.uuid)
//     }
//     if (request.method === 'post' || request.method === 'put' || request.method === 'delete') {
//       await config.store.clear()
//     }
//   }
// })

const customAxios = axios.create({
  // adapter: cache.adapter,
  // timeout: 10000 // request timeout
})

// axios.defaults.baseURL = "https://example.com/";

customAxios.interceptors.request.use(
  config => {
    // perform a task before the request is sent
    config.url = "/api" + config.url;
    
    return config;
  },
  error => {
    // handle the error
    return Promise.reject(error);
  }
);

// declare a response interceptor
customAxios.interceptors.response.use(
  response => {
    // do something with the response data
    // console.log("Response was received");

    return response;
  },
  error => {
    return handleError(error)
  }
);

function handleError(error) {
    if (process.env.NODE_ENV === "development") {
      console.log(error);
    }
    if (error.config.selfErrorHandle) {
      return Promise.reject(error);
    }
    
    if (error.code === 'ECONNABORTED') {
      store.dispatch("showAlert", {
        type: "danger",
        text: '連線逾時'
      });
    }

    if (!error && !error.response) {
      return Promise.reject(error)
    }
    
    let msg = "";
    if (typeof error.response.data !== 'undefined' && typeof error.response.data.msg !== "undefined") {
      msg = error.response.data.msg;
    } else {
      msg = error.response.statusText;
    }
    // 400 為表單錯誤 不用提示視窗顯示
    
    // 403 禁止存取
    if (error.response.status === 403 && !store.state.handleForbidden) {
      store.state.handleForbidden = true // 避免同時多個403返回重複執行
      setTimeout(() => {
        store.state.handleForbidden = false //一秒後設回false
      }, 1000);

      if (msg === 'No login') {
        if (store.state.localUser) {
          msg = "登入逾時，請重新登入"
        } else {
          msg = "請先登入"
        }
        store.dispatch('userLogout')      
        router.push('/login?redirect=' + encodeURI(window.location.pathname))
      } else {
        msg = '無權操作'
        router.push('/')
      }

      store.dispatch("showAlert", {
        type: "warning",
        text: msg
      })
      
    }
    
    // 404 找不到網頁
    if (error.response.status === 404) {
      store.dispatch("showAlert", {
        type: "warning",
        text: "查無此內容"
      });
      router.push('/')
    }
    
    // 422 422 Unprocessable Entity
    // 資料格式錯誤，與400區別，以利前端分別顯示錯誤方式
    // 多用於post, put
    if (error.response.status === 422) {
      store.dispatch("showAlert", {
        type: "warning",
        text: msg
      });
    }
    
    // 500 系統錯誤
    if (error.response.status === 500) {
      store.dispatch("showAlert", {
        type: "danger",
        text: msg
      });
    }
    
    return Promise.reject(error);
}

export { customAxios as axios }
