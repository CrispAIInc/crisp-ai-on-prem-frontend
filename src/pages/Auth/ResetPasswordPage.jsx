import React from 'react';
import ResetPassword from "../../components/Auth/ResetPassword";
import AuthLayout from '../../components/Auth/Layout';


function ResetPasswordPage({ theme }) {
    return (
        <AuthLayout>
            <ResetPassword theme={theme} />
        </AuthLayout>
    );
}

export default ResetPasswordPage;