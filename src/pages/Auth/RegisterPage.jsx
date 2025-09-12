import React from 'react';
import Register from "../../components/Auth/Register";
import AuthLayout from '../../components/Auth/Layout';


function RegisterPage({ theme }) {
    return (
        <AuthLayout>
            <Register theme={theme} />
        </AuthLayout>
    );
}

export default RegisterPage;