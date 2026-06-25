import axios from "axios";
import { baseURL } from "./constants";
import { forceLogout } from "./auth";

export const getAxios = (isFormData = false) => {
  let axiosInstance;

  const token = window.localStorage.getItem("token");

  const headers = {
    Accept: "application/json",
    ...(token && { Authorization: "Bearer " + token }),
    ...(isFormData
      ? {} // ⚠️ Let Axios handle Content-Type when using FormData
      : { "Content-Type": "application/json" }),
  };

  axiosInstance = axios.create({
    headers,
    timeout: 3000000,
  });

  axiosInstance.interceptors.response.use(
    function (response) {
      return Promise.resolve(response);
    },
    function (error) {
      if (error.response?.status === 401) {
        forceLogout();
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const get = (uri) => {
  return new Promise((resolve, reject) => {
    getAxios()
      .get(baseURL + uri)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const post = (uri, data, isFormData = false) => {
  return new Promise((resolve, reject) => {
    getAxios(isFormData)
      .post(baseURL + uri, data)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
