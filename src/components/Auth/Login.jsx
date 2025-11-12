import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";
import GoogleAuthButton from "../Auth/GoogleAuthButton";
import HorizontalOrText from '../HorizontalOrText';
import { loginWithUsernameAndPassword } from '../../services/auth.js';
import { Alert } from '@mui/material';
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../../config/firebase.js"; // adjust path

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { MainContext } from '../../contexts/mainContext.jsx';
import { isValidEmail } from '../../utils.js';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useContext(MainContext);
    const { redirectedFromAccountVerification = false } = location.state || {};
    const [userInfo, setUserInfo] = useState({
        email: "",
        username: "",
        password: "",
    });
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const [isLoginWithUsername, setIsLoginWithUsername] = useState(true);

    async function login() {
        try {
            setIsPending(true);
            setError(null);

            if ((!userInfo.username && isLoginWithUsername) || (!userInfo.email && !isLoginWithUsername) || !userInfo.password) {
                throw new Error("All fields are required.");
            }

            if (!isLoginWithUsername && !isValidEmail(userInfo?.email)) {
                throw new Error("Please enter a valid email address.");
            }

            await loginWithUsernameAndPassword(userInfo);

            const idToken = await new Promise((resolve, reject) => {
                const unsubscribe = onIdTokenChanged(auth, async (user) => {
                    if (user) {
                        try {
                            const token = await user.getIdToken();
                            unsubscribe();
                            resolve(token);
                        } catch (err) {
                            unsubscribe();
                            reject(err);
                        }
                    }
                });

                // safety timeout: reject after 10s
                const timeout = setTimeout(() => {
                    try { unsubscribe(); } catch (e) { console.log(""); }
                    reject(new Error("Timed out waiting for Firebase token"));
                }, 10000);
            });

            setTimeout(() => {
                // Reset userInfo after registration attempt
                setUserInfo({
                    // email: "",
                    username: "",
                    password: "",
                });
                setIsPending(false);
                navigate('/');
            }, 3000);
        } catch (e) {
            setError(e?.message || e?.response?.data?.message || "Please verify your data and try again.");
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
            <style>
                {
                    `
                                .MuiTypography-root {
                                    font-size: 13px !important;
                                }
                                .MuiButtonBase-root {
                                padding-right: 1px!important;   
                            }}
                                `
                }
            </style>
            <FormControl>
                <RadioGroup
                    row
                    aria-labelledby="login-type-radio-group"
                    name="login-type-radio-group"
                    value={isLoginWithUsername ? "Username" : "Email"}
                    onChange={(e) => setIsLoginWithUsername(e.target.value === "Username")}
                >
                    {["Username", "Email"].map((item, index) => (
                        <FormControlLabel
                            key={index}
                            value={item}
                            control={<Radio />}
                            label={item}
                            className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
            <div className="flex flex-col gap-4">
                {isLoginWithUsername ? <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Username"
                    value={userInfo.username}
                    setValue={(value) => setUserInfo({ ...userInfo, username: value })}
                    type="text"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            login();
                        }
                    }}
                /> : <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Email"
                    value={userInfo.email}
                    setValue={(value) => setUserInfo({ ...userInfo, email: value })}
                    type="email"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            login();
                        }
                    }}
                />}
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
