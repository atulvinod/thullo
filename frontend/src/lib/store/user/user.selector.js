export const currentUserSelector = (state) => state.user.user;
export const tokenSelector = (state) => state.user.token
export const loginErrorSelector = (state) => state.user.loginError;
export const loadingSelector = (state) => state.user.isLoading;
export const registerErrorSelector = (state) => state.user.registerErrorSelector;