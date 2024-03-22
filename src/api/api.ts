import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:3000/api/",
    baseURL: "https://socketio-test-rzgz.onrender.com/api/",
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
