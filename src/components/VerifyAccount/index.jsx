import React, { useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';
import AuthLayout from '../Auth/Layout';
import { useLocation } from 'react-router';

export default function VerifyAccount() {
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    //TODO: get the email from the query params state
    const { state: { email } } = location;

    const OTP_LENGTH = 6;

    useEffect(() => {
        if (otp.length === OTP_LENGTH) {
            setIsPending(true);
            setError(null);
            // Call your API to verify the OTP
            fetch('http://localhost:5000/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // alert('Account verified successfully!');
                        //TODO: redirect user to login page
                        //...
                    } else {
                        setError('Invalid OTP. Please try again.');
                        // setOtp(''); // Clear the OTP input
                    }
                })
                .catch(error => {
                    console.error('Error verifying OTP:', error);
                    // alert('An error occurred while verifying the OTP. Please try again later.');
                    setError('Invalid OTP. Please try again.');
                    // setOtp(''); // Clear the OTP input
                });
        }
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
                    isDisabled={true}
                    hasErrored={true}
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