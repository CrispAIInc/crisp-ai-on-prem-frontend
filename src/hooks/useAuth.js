import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_TOKEN_CHANGED_EVENT, clearStoredCurrentProject, TOKEN_NAME } from "../globals";

export default function useAuth() {
    const navigate = useNavigate();
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_NAME));

    useEffect(() => {
        const syncToken = () => setToken(localStorage.getItem(TOKEN_NAME));
        window.addEventListener("storage", syncToken);
        window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
        return () => {
            window.removeEventListener("storage", syncToken);
            window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
        };
    }, []);

    return {
        token,
        isAuthenticated: token !== null,
        loading: false,
        login: () => { },
        logout: async (redirectUrl = "/login", redirectOptions = {}) => {
            clearStoredCurrentProject();
            localStorage.removeItem(TOKEN_NAME);
            window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
            setToken(null);
            navigate(redirectUrl, {
                state: {
                    ...redirectOptions
                }
            });
        },
    };
}
