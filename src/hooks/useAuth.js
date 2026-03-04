import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onIdTokenChanged, signOut } from "firebase/auth";

export default function useAuth() {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    useEffect(() => {
        // Subscribe to token changes
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const idToken = await user.getIdToken();
                setToken(idToken);
            } else {
                setToken(null);
            }
            setLoading(false); // ✅ done checking
        });

        return () => unsubscribe();
    }, [auth]);

    return {
        token,
        isAuthenticated: token !== null,
        loading,
        login: () => { },
        logout: async (redirectUrl = "/login", redirectOptions = {}) => {
            await signOut(auth);
            setToken(null);
            navigate(redirectUrl, {
                state: {
                    ...redirectOptions
                }
            });
        },
    };
}
