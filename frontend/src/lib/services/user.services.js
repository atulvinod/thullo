import client from "../utils/axios.util";

export const loginWithEmailAndPassword = async (email, password) => {
    const { data } = await client.post("user/login", { email, password });
    return data.data;
};

export const registerUser = async (user_data) => {
    const { data } = await client.post("user/register", user_data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data.data;
};

export const searchUser = async (name) => {
    const { data } = await client.get("user/search", { params: { name } });
    return data.data;
};

export const forgotPasswordRequest = async (email) => {
    await client.post("user/forgot-password", { email });
};

export const resetPasswordRequest = async (token, new_password) => {
    await client.post("user/reset-password", { token, new_password });
};
