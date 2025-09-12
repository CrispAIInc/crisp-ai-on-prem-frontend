import React from 'react';
import AuthLayout from '../../components/Auth/Layout';
import ForgotPassword from '../../components/Auth/ForgotPassword';


function ForgotPasswordPage({ theme }) {
    return (
        <AuthLayout>
            <ForgotPassword theme={theme} />
        </AuthLayout>
    );
}

export default ForgotPasswordPage;