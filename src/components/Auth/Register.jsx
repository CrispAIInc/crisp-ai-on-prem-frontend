import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";
import makeApiRequest from '../../api';
import GoogleAuthButton from "../Auth/GoogleAuthButton";
import HorizontalOrText from '../HorizontalOrText';
import { isValidEmail } from "../../utils.js";
import { sendEmail } from '../../services/messaging.js';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import { createUserWithFirestore, loginWithAccessAndRefreshToken } from '../../services/auth.js';



export default function Register() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    async function register() {
        try {
            setIsPending(true);
            setError(null);

            // Validate user input
            if (!userInfo.firstName || !userInfo.lastName || !userInfo.email || !userInfo.password || !userInfo.confirmPassword) {
                throw new Error("All fields are required.");
            }
            if (!isValidEmail(userInfo.email)) {
                throw new Error("Please enter a valid email address.");
            }
            if (userInfo.password !== userInfo.confirmPassword) {
                throw new Error("Passwords do not match.");
            }

            // create user in firebase first
            // const userCredential = await createUserWithFirestore(userInfo.email, userInfo.password);
            // send email verification to the user


            // Here you would typically make an API call to register the user
            const { success, message } = await makeApiRequest('/sign-up', 'POST', JSON.stringify(userInfo));

            if (success) {
                console.log("Registration successful! but need to verify email");
                // const user = await loginWithAccessAndRefreshToken(userInfo.email, userInfo.password);
                // console.log("user from firebase sign in login", user);
                // await sendEmail(user);
                //TODO: show user a info card letting them know that a verification email has been send to their email
                setError(false);
                // redirect to login page after 5 seconds delay
                setTimeout(() => {
                    navigate('/verify', { state: { email: userInfo.email } });
                }, 5000);
            } else {
                console.log(message);
                throw new Error(message || "Registration failed. Please try again.");
            }

            // Reset userInfo after registration attempt
            setUserInfo({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (e) {
            if (e.code === "auth/email-already-in-use") {
                setError("Email already registered. Please sign in or use another email.");
            }
            else if (e.code === "auth/weak-password") {
                setError("Password should be at least 6 characters.");
            }
            else setError(e?.response?.data?.message || e?.message || "Please verify your data and try again.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col w-full">
            {/* <img src="./imgs/app-logo-full.png" alt="CrispAI logo" className='w-[50%] h-auto mx-auto mb-10' /> */}
            <h1 className="mb-10 text-4xl font-bold text-center">Create an account</h1>
            {
                error === false ? <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className='mb-4'>
                    Verification email sent! Please check your inbox.
                </Alert> : error !== null ? <p className="mb-4 text-center text-red-500">{error}</p> : null

            }
            <div className="flex flex-col gap-4">
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Firstname"
                    value={userInfo.firstName}
                    setValue={(value) => setUserInfo({ ...userInfo, firstName: value })}
                    type="text"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            register();
                        }
                    }}
                />
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Lastname"
                    value={userInfo.lastName}
                    setValue={(value) => setUserInfo({ ...userInfo, lastName: value })}
                    type="text"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            register();
                        }
                    }}

                />
                <AnimatedInput
                    inputClasses="!pl-[20px]"
                    label="Email Address"
                    value={userInfo.email}
                    setValue={(value) => setUserInfo({ ...userInfo, email: value })}
                    type="email"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            register();
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
                            register();
                        }
                    }}

                />
                <AnimatedInput
                    isPassword
                    name="confirmPassword"
                    inputClasses="!pl-[20px]"
                    label="Confirm password"
                    value={userInfo.confirmPassword}
                    setValue={(value) => setUserInfo({ ...userInfo, confirmPassword: value })}
                    type="password"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            register();
                        }
                    }}

                />
                <RippleButton fullWidth cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2" onClick={register}>
                    {isPending && <span className="loader-atom"></span>}
                    <span>Create</span>
                </RippleButton>
            </div>
            <p className='mt-2 text-sm font-bold text-center text-textColor-200'>Already have an account? <Link className="text-primary-300" to="/login">Sign in</Link></p>

            <HorizontalOrText />
            <GoogleAuthButton />
        </div>
    );
}
