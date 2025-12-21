import React, { useContext } from "react";
import useAuth from "../../hooks/useAuth";
import { Navigate } from "react-router";
// import { AuthContext } from '../../contexts/authContext';

function PrivateRoute({ children }) {
    
    // const {authReady} = useContext(AuthContext)
    const { isAuthenticated, token, loading } = useAuth();

    // if (!authReady) return null;

    if (!loading) {
        return token ? children : <Navigate to="/login" />;
    }
}

export default PrivateRoute;
