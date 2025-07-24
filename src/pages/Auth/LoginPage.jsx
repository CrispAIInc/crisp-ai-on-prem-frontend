import React from 'react';
import Login from "../../components/Auth/Login";
import AuthLayout from '../../components/Auth/Layout';


function LoginPage({ theme }) {
    return (
        <AuthLayout>
            <Login theme={theme} />
        </AuthLayout>
    );
}

export default LoginPage;