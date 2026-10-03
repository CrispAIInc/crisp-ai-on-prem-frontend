import { createContext, useEffect, useState } from "react";
import makeApiRequest from '../api';
import { pick } from '../utils';
import useTokenRefreshSchedule from '../hooks/useTokenRefresSchedule';
import useAuth from '../hooks/useAuth';

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {

    const {
        isAuthenticated
    } = useAuth();

    const [user, setUser] = useState({
        userId: "",
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        emailVerified: false,
    });

    function reinitializeUser() {
        setUser({
            userId: "",
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            emailVerified: false,
        });
    }

    useTokenRefreshSchedule(isAuthenticated);

    // const [authReady, setAuthReady] = useState(false);
    // useEffect(() => {
    //   const getUserInfo = async () => {
    //     try {
    //       const data = await makeApiRequest("/me", "get");
    //       const userWithSpecificProperties = pick(data, ["firstName", "lastName", "email", "username"]);
    //         setUser({
    //           userId: data.user_id,
    //           firstName: data?.display_name.split(" ")[0] ?? data.firstName,
    //           lastName: data?.display_name.split(" ").slice(1).join(" ") ?? data.lastName,
    //           ...userWithSpecificProperties,
    //           emailVerified: data.email_verified,
    //         });
    //     } catch (error) {
    //         console.error("Error fetching user info:", error);
    //       }
    //   };
    //   getUserInfo();
    // }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, reinitializeUser }}>
            {children}
        </AuthContext.Provider>
    );
}
