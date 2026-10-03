import { Alert } from '@mui/material';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";
import useAuth from '../../hooks/useAuth';

export default function Login() {
    const {
        loginWithUsernameAndPassword
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { redirectedFromAccountVerification = false } = location.state || {};
    const [userInfo, setUserInfo] = useState({
        pseudo: "",
        password: "",
    });
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    async function login() {
        try {
            setIsPending(true);
            setError(null);
            if (!userInfo.pseudo || !userInfo.password) {
                throw new Error("All fields are required.");
            }

            await loginWithUsernameAndPassword(userInfo);

            setUserInfo({
                pseudo: "",
                password: "",
            });
            setIsPending(false);
            navigate('/');
        } catch (e) {
            setError(e.message || "Please verify your data and try again.");
            setIsPending(false);
        }
    }


    return (
        <div className="flex flex-col w-full">
            {/* <img src="./imgs/app-logo-full.png" alt="CrispAI logo" className='w-[50%] h-auto mx-auto mb-10' /> */}
            <h1 className="mb-10 text-4xl font-bold text-center">Sign-in</h1>
            {
                error && <p className="mb-4 text-center text-red-500">{error}</p>
            }

            {
                redirectedFromAccountVerification && <Alert className="mb-3">You have successfully verified your account!</Alert>
            }
            <div className="flex flex-col gap-4">
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Username or Email"
                    value={userInfo.pseudo}
                    setValue={(value) => setUserInfo({ ...userInfo, pseudo: value })}
                    type="text"
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

        </div>
    );
}
