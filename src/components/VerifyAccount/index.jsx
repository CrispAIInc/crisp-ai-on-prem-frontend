import React, { useState } from 'react';
import OtpInput from 'react-otp-input';

export default function App() {
    const [otp, setOtp] = useState('');

    return (
        <div>
            <h1 className="text-4xl font-bold text-center">Verify your Crisp AI account!</h1>
            <h3 className="mb-10 text-center text-medium">insert the 6-digit code you received in your email.</h3>
            <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={4}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
            />
        </div>
    );
}