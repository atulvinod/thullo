import axios from "axios";
import config from '../../config/config.json';

const client = axios.create({
    baseURL: 'https://api.unsplash.com',
    headers: {
        Authorization: `Client-ID ${config.unsplash_api_key}`
    }
})

export const searchPhoto = async (keyword) => {
    const { data } = await client.get(`/search/photos`, {
        params: {
            per_page: 12,
            query: keyword,
            page: 1
        }
    })
    return data.results;
}