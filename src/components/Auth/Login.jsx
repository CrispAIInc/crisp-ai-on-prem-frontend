import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput';
import RippleButton from "../RippleButton";
import makeApiRequest from '../../api';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../config/firebase';

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

            // Here you would typically make an API call to register the user
            const { success, accessToken, message } = await makeApiRequest('/login', 'POST', JSON.stringify(userInfo));

            if (success) {
                // Step 3: Exchange custom token for Firebase ID token
                const userCredential = await signInWithCustomToken(auth, accessToken);

                console.log("User signed in:", userCredential.user);

                // Now you can use getIdToken() anytime
                const idToken = await userCredential.user.getIdToken();
                console.log("Firebase ID Token:", idToken);

                // Optionally store idToken if you want
                localStorage.setItem("idToken", idToken);
                // localStorage.setItem('accessToken', accessToken);
                navigate('/');
            } else {
                throw new Error(message || "Login failed. Please try again.");
            }

            // Reset userInfo after registration attempt
            setUserInfo({
                email: "",
                password: "",
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
                <RippleButton fullWidth cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2" onClick={login}>
                    {isPending && <span className="loader-atom"></span>}
                    <span>Sign in</span>
                </RippleButton>
            </div>
            <p className='mt-2 text-sm font-bold text-center text-textColor-200'>Forgot password? <Link className="text-primary-300" to="/forgot-password">click here!</Link></p>
            <p className='text-sm font-bold text-center text-textColor-200'>Don&apos;t  have an account? <Link className="text-primary-300" to="/sign-up">Sign up</Link></p>
        </div>
    );
}
