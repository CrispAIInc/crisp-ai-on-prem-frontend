import { useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";

export default function Register() {
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    function register() {
        try {
            setIsPending(true);
            setError(null);

            // Validate user input
            if (!userInfo.firstName || !userInfo.lastName || !userInfo.email || !userInfo.password || !userInfo.confirmPassword) {
                throw new Error("All fields are required.");
            }
            if (userInfo.password !== userInfo.confirmPassword) {
                throw new Error("Passwords do not match.");
            }

            // Here you would typically make an API call to register the user

            // Reset userInfo after registration attempt
            setUserInfo({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (e) {
            setError(e.message || "Please verify your data and try again.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col w-full">
            {/* <img src="./imgs/app-logo-full.png" alt="CrispAI logo" className='w-[50%] h-auto mx-auto mb-10' /> */}
            <h1 className="mb-10 text-4xl font-bold text-center">Create an account</h1>
            {
                error && <p className="mb-4 text-center text-red-500">{error}</p>
            }
            <div className="flex flex-col gap-4">
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Firstname"
                    value={userInfo.firstName}
                    setValue={(value) => setUserInfo({ ...userInfo, firstName: value })}
                    type="text"
                />
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Lastname"
                    value={userInfo.lastName}
                    setValue={(value) => setUserInfo({ ...userInfo, lastName: value })}
                    type="text"
                />
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Email Address"
                    value={userInfo.email}
                    setValue={(value) => setUserInfo({ ...userInfo, email: value })}
                    type="email"
                />
                <AnimatedInput
                    isPassword
                    name="password"
                    inputClasses="!pl-[20px]"
                    label="Password"
                    value={userInfo.password}
                    setValue={(value) => setUserInfo({ ...userInfo, password: value })}
                    type="password"
                />
                <AnimatedInput
                    isPassword
                    name="confirmPassword"
                    inputClasses="!pl-[20px]"
                    label="Confirm password"
                    value={userInfo.confirmPassword}
                    setValue={(value) => setUserInfo({ ...userInfo, confirmPassword: value })}
                    type="password"
                />
                <RippleButton fullWidth cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2" onClick={register}>
                    {isPending && <span className="loader-atom"></span>}
                    <span>Create</span>
                </RippleButton>
            </div>
            <p className='mt-2 text-sm font-bold text-center text-textColor-200'>Already have an account? <Link className="text-primary-300" to="/login">Sign in</Link></p>
        </div>
    );
}
