import { auth, provider } from "../../config/firebase.js";
import { signInWithPopup } from "firebase/auth";

import makeApiRequest from "../../api";

function Login() {
    const handleLogin = async () => {
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

    return <button onClick={handleLogin}>Sign in with Google</button>;
}

export default Login;
