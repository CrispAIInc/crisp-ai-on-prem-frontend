import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import { useLocation } from 'react-router';
import Modal from 'react-bootstrap/Modal';

export default function VerifyAccountModal({ show, onHide }) {
    const [otp, setOtp] = useState('');
    // get the email from the location state
    const location = useLocation();
    const { email } = location.state || {};

    const OTP_LENGTH = 6;

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