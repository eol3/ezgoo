import router from "../router/index";
import store from "../store/index";
import axios from "axios";

const customAxios = axios.create({
  // adapter: cache.adapter,
  timeout: 10000 // request timeout
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
    let msg = "";
    if (typeof error.response.data.msg !== "undefined") {
      msg = error.response.data.msg;
    } else {
      msg = error.response.statusText;
    }
    
    // 400 為表單錯誤 不用提示視窗顯示
    
    // 403 禁止存取
    if (error.response.status === 403) {
      if (store.state.member) {
        store.dispatch("show_alert", {
          type: "warning",
          text: "登入逾時，請重新登入"
        })
      } else {
        store.dispatch("show_alert", {
          type: "warning",
          text: msg
        })
      }
      
      store.dispatch('memberLogout')
      
      if (window.location.pathname !== '/member/login') {
        router.push('/member/login?redirect=' + encodeURI(window.location.pathname))
      } else {
        router.push('/')
      }
      
    }
    
    // 404 找不到網頁
    // 422 422 Unprocessable Entity
    // 資料格式錯誤，與400區別，以利前端分別顯示錯誤方式
    // 多用於post, put
    if (error.response.status === 404 || error.response.status === 422) {
      
      store.dispatch("show_alert", {
        type: "warning",
        text: msg
      });
      
      if (error.response.status === 404) {
        router.push('/')
      } else {
        // do nothing
      }
    }
    
    // 500 系統錯誤
    if (error.response.status === 500) {
      store.dispatch("show_alert", {
        type: "danger",
        text: msg
      });
    }
    
    return Promise.reject(error);
}

export { customAxios as axios }
