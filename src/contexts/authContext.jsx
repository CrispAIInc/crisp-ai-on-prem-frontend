import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        emailVerified: false,
    });

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
