import React, { useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';
import AuthLayout from '../Auth/Layout';
import { useLocation, useNavigate } from 'react-router';
import makeApiRequest from '../../api';

export default function VerifyAccount() {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    //TODO: get the email from the query params state
    // const { state: { email = "johndoe@mail.com" } = {} } = location;

    const OTP_LENGTH = 6;

    useEffect(() => {
        async function verifyOtp() {
            if (otp.length === OTP_LENGTH) {
                setIsPending(true);
                setError(null);
                try {
                    const { success, message } = await makeApiRequest('/verify-otp', 'POST', JSON.stringify({ otp }));
                    if (!success) {
                        throw new Error(message);
                    } else {
                        navigate('/login', {
                            state: {
                                redirectedFromAccountVerification: true
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error verifying OTP:', error);
                    setError(error.message);
                }
            }
        }

        verifyOtp();
    }, [otp]);

    return (
        <AuthLayout>
            <div className="">
                <h1 className="text-2xl font-bold text-center">Verify your <span className="text-xl font-bold text-gradient-x">Crisp AI</span> account!</h1>
                <h3 className="mb-10 text-sm text-center text-medium">insert the {OTP_LENGTH}-digit code you received in your email.</h3>
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={OTP_LENGTH}
                    isDisabled={isPending}
                    hasErrored={error !== null}
                    inputStyle={{
                        width: '3rem',
                        height: '3rem',
                        margin: '0 1rem',
                        fontSize: '2rem',
                        borderRadius: 4,
                        border: '1px solid ' + (error ? 'red' : 'rgba(0,0,0,0.3)'),
                    }}
                    containerStyle={{
                        justifyContent: 'center',
                        marginBottom: '2rem',
                    }}
                    isInputNum
                    shouldAutoFocus

                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} />}
                />
            </div>
        </AuthLayout>
    );
}