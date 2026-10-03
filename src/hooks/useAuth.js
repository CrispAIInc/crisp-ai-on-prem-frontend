import { AUTH_TOKEN_CHANGED_EVENT, clearStoredCurrentProject } from "../globals";
import makeApiRequest from '../api';
import { tokenStorage } from '../utils/tokenStorage';

export default function useAuth() {

    // useEffect(() => {
    //     const syncToken = () => setToken(localStorage.getItem(TOKEN_NAME));
    //     window.addEventListener("storage", syncToken);
    //     window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
    //     return () => {
    //         window.removeEventListener("storage", syncToken);
    //         window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
    //     };
    // }, []);

    const loginWithUsernameAndPassword = async (userInfo) => {
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
        // window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
        return accessToken;
    };

    async function logout(navigate, redirectUrl = "/login", redirectOptions = {}) {
        tokenStorage.clear();
        clearStoredCurrentProject();
        window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
        navigate("/login");
        navigate(redirectUrl, {
            state: {
                ...redirectOptions
            }
        });
    }

    return {
        loginWithUsernameAndPassword,
        token: tokenStorage.getAccessToken(),
        isAuthenticated: tokenStorage.getAccessToken() !== null,
        loading: false,
        logout
    };
}
