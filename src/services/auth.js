import { signInWithCustomToken, signInWithPopup } from 'firebase/auth';
import { TOKEN_NAME } from '../globals';
import { auth, provider } from '../config/firebase';
import makeApiRequest from '../api';


export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const token = await user.getIdToken(); // Firebase ID token
        localStorage.setItem(TOKEN_NAME, token);
    } catch (err) {
        console.error(err);
    }
};

export const loginWithEmailAndPassword = async (userInfo) => {
    const { success, accessToken, message } = await makeApiRequest('/login', 'POST', JSON.stringify(userInfo));

    if (success) {
        // Step 3: Exchange custom token for Firebase ID token
        const userCredential = await signInWithCustomToken(auth, accessToken);

        console.log("User signed in:", userCredential.user);

        // Now you can use getIdToken() anytime
        const idToken = await userCredential.user.getIdToken();
        console.log("Firebase ID Token:", idToken);

        // Optionally store idToken if you want
        localStorage.setItem(TOKEN_NAME, idToken);
    } else {
        throw new Error(message || "Login failed. Please try again.");
    }
};