import React from "react";
import useAuth from "../../hooks/useAuth";
import { Navigate } from "react-router";

function PrivateRoute({ children }) {
    const { isAuthenticated, token, loading } = useAuth();

    console.log(token);

    if (!loading) {
        return token ? children : <Navigate to="/login" />;
    }
}

export default PrivateRoute;
