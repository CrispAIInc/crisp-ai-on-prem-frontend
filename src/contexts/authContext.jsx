import { createContext, useEffect, useState } from "react";
import makeApiRequest from '../api';
import { pick } from '../utils';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState({
        userId: "",
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        emailVerified: false,
    });

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
