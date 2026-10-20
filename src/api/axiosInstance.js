import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://udemy-backend-1-tjmq.onrender.com"
      : "http://localhost:5000"),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const storedToken = sessionStorage.getItem("accessToken");
    const accessToken = storedToken ? JSON.parse(storedToken) : "";

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;
