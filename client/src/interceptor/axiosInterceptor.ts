import axios, { InternalAxiosRequestConfig } from "axios";
import { url } from "../baseUrl";

const axiosInstance = axios.create({});

interface CustomAxiosConfig extends InternalAxiosRequestConfig<any> {
  headers: any;
}

axiosInstance.interceptors.request.use(
  async (config: CustomAxiosConfig) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const parsedToken = JSON.parse(token);
        config.headers = {
          Authorization: `Bearer ${parsedToken}`,
        };
      }
    } catch (error) {
      console.error("Error parsing access token:", error);
      localStorage.removeItem("access_token");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "UnAuthorized, JWT Expired"
    ) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const parsedRefreshToken = JSON.parse(refreshToken);
          const response = await axiosInstance.post(`${url}/auth/token`, {
            token: parsedRefreshToken,
          });
          localStorage.setItem(
            "access_token",
            JSON.stringify(response.data.access_token)
          );

          axiosInstance.defaults.headers["Authorization"] =
            "Bearer " + response.data.access_token;
          originalRequest.headers["Authorization"] =
            "Bearer " + response.data.access_token;
          return await axiosInstance(originalRequest);
        } catch (err) {
          console.error("Token refresh failed:", err);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/signin/in";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const httpRequest = axiosInstance;
