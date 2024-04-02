import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:3000/api/",
  baseURL:
    process.env.NODE_ENV == "development"
      ? "http://localhost:3000/api/"
      : "https://socketiotest.adaptable.app/api/",
  // baseURL: "https://socketio-test-rzgz.onrender.com/api/",
});

const token = localStorage.getItem("auth_token");
instance.interceptors.request.use(
  (config) => {
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
