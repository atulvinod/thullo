import axios from "axios";
import { store } from '../store';
import config from '../../config/config.json';
import { toast } from 'react-toastify';

function select(state) {
    return state.user?.token;
}

const client = axios.create({
    baseURL: process.env.FE_BASE_URL ?? config.environments.local.base_url,
})

client.interceptors.request.use(function (config) {
    // Do something before request is sent
    const token = select(store?.getState())
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, function (error) {
    console.log(error);
    // Do something with request error
    return Promise.reject(error);
})

client.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    return Promise.reject(error);
})

export default client;


