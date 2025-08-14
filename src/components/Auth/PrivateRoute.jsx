import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router';

function PrivateRoute({ children, ...rest }) {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;