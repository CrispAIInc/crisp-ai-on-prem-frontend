import { AUTH_TOKEN_CHANGED_EVENT, clearStoredCurrentProject, TOKEN_NAME } from '../globals';
import makeApiRequest from '../api';
import { tokenStorage } from '../utils/tokenStorage';

export async function getJwt() {
    return localStorage.getItem(TOKEN_NAME);
}

export const loginWithUsernameAndPassword = async (userInfo) => {
    const { success, accessToken, refreshToken, expiresIn, message } = await makeApiRequest('/login', 'POST', JSON.stringify(userInfo));

    if (!success || !accessToken) {
        throw new Error(message || "Login failed. Please try again.");
    }

    tokenStorage.setTokens({
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: expiresIn,
    });
    clearStoredCurrentProject();
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
    return accessToken;
};

export async function logOut(navigate) {
    tokenStorage.clear();
    clearStoredCurrentProject();
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
    navigate("/login");
}
