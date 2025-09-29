import React, { useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';
import Modal from 'react-bootstrap/Modal';

export default function VerifyAccountModal({ show, onHide, email }) {
    const [otp, setOtp] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

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
                        alert('Account verified successfully!');
                        //TODO: redirect user to login page
                        //...
                        onHide(); // Close the modal
                    } else {
                        setError('Invalid OTP. Please try again.');
                        setOtp(''); // Clear the OTP input
                    }
                })
                .catch(error => {
                    console.error('Error verifying OTP:', error);
                    alert('An error occurred while verifying the OTP. Please try again later.');
                    setError('Invalid OTP. Please try again.');
                    setOtp(''); // Clear the OTP input
                });
        }
    }, [otp]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Body>
                <div className="my-6">
                    <h1 className="text-2xl font-bold text-center">Verify your <span className="text-4xl font-bold text-gradient-x">Crisp AI</span> account!</h1>
                    <h3 className="mb-10 text-sm text-center text-medium">insert the {OTP_LENGTH}-digit code you received in your email.</h3>
                    <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={OTP_LENGTH}
                        isDisabled={isPending}
                        hasErrored={!!error}
                        inputStyle={{
                            width: '3rem',
                            height: '3rem',
                            margin: '0 1rem',
                            fontSize: '2rem',
                            borderRadius: 4,
                            border: '1px solid rgba(0,0,0,0.3)',
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
            </Modal.Body>
        </Modal>
    );
}