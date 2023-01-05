import router from "@/router/index";
import store from "@/store/index";
import axios from "axios";

// import { setupCache } from 'axios-cache-adapter'

function serializeQuery(obj) {
  let str = "?";
  for (var key in obj) {
      if (str != "") {
          str += "&";
      }
      str += key + "=" + encodeURIComponent(obj[key]);
  }
  if (str === '?') return ''
  else return str
}

// Create `axios-cache-adapter` instance
// const cache = setupCache({
//   key: req => {
//     if (req.params === undefined) return req.url
//     else return req.url + serializeQuery(req.params)
//   },
//   maxAge: 15 * 60 * 1000,
//   exclude: { query: false }
// })

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
    if (process.env.NODE_ENV === "development") {
      console.log(error.response);
    }
    let msg = "";
    if (typeof error.response.data.msg !== "undefined") {
      msg = error.response.data.msg;
    } else {
      msg = error.response.statusText;
    }
    
    // 400 為表單錯誤 不用提示視窗顯示
    
    if (error.response.status === 403 || error.response.status === 404 || error.response.status === 422) {
      
      store.dispatch("show_alert", {
        type: "warning",
        text: msg
      });
      
      if (error.response.status === 403) {
        store.dispatch("memberLogout")
        if (window.location.pathname !== '/member/login') {
          router.push('/member/login?redirect=' + encodeURI(window.location.pathname))
        }
      } else if (error.response.status === 404) {
        router.push('/')
      } else {
        // do nothing
      }
    }
    
    if (error.response.status === 500) {
      store.dispatch("show_alert", {
        type: "danger",
        text: msg
      });
    }
    
    return Promise.reject(error);
  }
);

export default customAxios;
