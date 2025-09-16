import { auth, provider } from "../../config/firebase.js";
import { signInWithPopup } from "firebase/auth";

import makeApiRequest from "../../api";

function Login() {
    const handleGoogleSignIn = async () => {
        console.log("Google sign-in initiated");
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken(); // Firebase ID token

            // Send to Flask backend
            await makeApiRequest("/auth/google", "POST", JSON.stringify({ token }));
        } catch (err) {
            console.error(err);
        }
    };

    return <button
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-md hover:bg-gray-100"
    >
        <img src="/google-logo.webp" alt="Google" className="w-5 h-5" />
        <span>Sign in with Google</span>
    </button>;
}

export default Login;
