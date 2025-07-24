import { useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    function handleForgotPassword() {
        try {
            setIsPending(true);
            setError(null);

            // Validate user input
            if (!email) {
                throw new Error("Email is required to reset your password..");
            }

            // Here you would typically make an API call to register the user

            // Reset userInfo after registration attempt
            setEmail("");
        } catch (e) {
            setError(e.message || "Please verify your data and try again.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col w-full">
            <img src="./imgs/app-logo-full.png" alt="CrispAI logo" className='w-[50%] h-auto mx-auto mb-10' />
            <h1 className="mb-10 text-4xl font-bold text-center">Forgot Password</h1>
            {
                error && <p className="mb-4 text-center text-red-500">{error}</p>
            }
            <div className="flex flex-col gap-4">
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Email Address"
                    value={email}
                    setValue={(value) => setEmail(value)}
                    type="email"
                />
                <RippleButton fullWidth cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2" onClick={handleForgotPassword}>
                    {isPending && <span className="loader-atom"></span>}
                    <span>Submit</span>
                </RippleButton>
            </div>
            <p className='mt-2 font-medium text-center text-textColor-200'>Remembered your password? <Link className="text-primary-300" to="/login">Sign in</Link></p>
        </div>
    );
}
