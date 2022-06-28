import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

const axiosInstance = axios.create({
    baseURL        : publicRuntimeConfig.BACKEND_BASE_URL,
    xsrfCookieName : 'csrftoken',
    xsrfHeaderName : 'X-CSRFToken'
});

axiosInstance.interceptors.response.use(response => response, error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest.__isRetryRequest) {
        originalRequest.__isRetryRequest = true;

        return new Promise((resolve, reject) => {
            axiosInstance.post('auth/token/refresh/').then(() => {
                resolve(axiosInstance(originalRequest));
            }).catch(() => {
                reject(originalRequest);
            });
        });
    }
    return Promise.reject(error);
});

export default axiosInstance;
