import { AUTH_TOKEN_CHANGED_EVENT, clearStoredCurrentProject, TOKEN_NAME } from '../globals';
import makeApiRequest from '../api';

export async function getJwt() {
    return localStorage.getItem(TOKEN_NAME);
}

export const loginWithUsernameAndPassword = async (userInfo) => {
    const { success, accessToken, message } = await makeApiRequest('/login', 'POST', JSON.stringify(userInfo));

    if (!success || !accessToken) {
        throw new Error(message || "Login failed. Please try again.");
    }

    clearStoredCurrentProject();
    localStorage.setItem(TOKEN_NAME, accessToken);
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
    return accessToken;
};

export async function logOut(navigate) {
    localStorage.removeItem(TOKEN_NAME);
    clearStoredCurrentProject();
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
    navigate("/login");
}
