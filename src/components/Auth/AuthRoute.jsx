import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router';

function AuthRoute({ children }) {

    const { isAuthenticated } = useAuth();

    return !isAuthenticated ? children : <Navigate to="/" />;

}

export default AuthRoute;