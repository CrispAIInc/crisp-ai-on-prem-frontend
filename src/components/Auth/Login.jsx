import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";
import GoogleAuthButton from "../Auth/GoogleAuthButton";
import HorizontalOrText from '../HorizontalOrText';
import { loginWithEmailAndPassword } from '../../services/auth.js';
import { isValidEmail } from '../../utils.js';

export default function Login() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        email: "",
        password: "",
    });
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    async function login() {
        try {
            setIsPending(true);
            setError(null);

            // Validate user input
            if (!userInfo.email || !userInfo.password) {
                throw new Error("All fields are required.");
            }

            if (!isValidEmail(userInfo.email)) {
                throw new Error("Please enter a valid email address.");
            }

            await loginWithEmailAndPassword(userInfo);
            setTimeout(() => {
                // Reset userInfo after registration attempt
                setUserInfo({
                    email: "",
                    password: "",
                });
                setIsPending(false);
                navigate('/');
            }, 3000);


        } catch (e) {
            setError(e?.response?.data?.message || "Please verify your data and try again.");
        }
    }

    return (
        <div className="flex flex-col w-full">
            {/* <img src="./imgs/app-logo-full.png" alt="CrispAI logo" className='w-[50%] h-auto mx-auto mb-10' /> */}
            <h1 className="mb-10 text-4xl font-bold text-center">Sign-in</h1>
            {
                error && <p className="mb-4 text-center text-red-500">{error}</p>
            }
            <div className="flex flex-col gap-4">
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Email Address"
                    value={userInfo.email}
                    setValue={(value) => setUserInfo({ ...userInfo, email: value })}
                    type="email"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            login();
                        }
                    }}
                />
                <AnimatedInput
                    isPassword
                    name="password"
                    inputClasses="!pl-[20px]"
                    label="Password"
                    value={userInfo.password}
                    setValue={(value) => setUserInfo({ ...userInfo, password: value })}
                    type="password"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            login();
                        }
                    }}
                />
                <RippleButton fullWidth cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2" onClick={login}>
                    {isPending && <span className="loader-atom"></span>}
                    <span>Sign in</span>
                </RippleButton>
            </div>
            <p className='mt-2 text-sm font-bold text-center text-textColor-200'>
                <Link className="text-primary-300" to="/forgot-password">Forgot password</Link>
            </p>
            <p className='text-sm font-bold text-center text-textColor-200'>Don&apos;t  have an account? <Link className="text-primary-300" to="/sign-up">Sign up</Link></p>

            <HorizontalOrText />
            <GoogleAuthButton />
        </div>
    );
}
