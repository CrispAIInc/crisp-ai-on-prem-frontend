import { onAuthStateChanged, onIdTokenChanged, signInWithCustomToken, signInWithPopup } from 'firebase/auth';
import { TOKEN_NAME } from '../globals';
import { auth, provider } from '../config/firebase';
import makeApiRequest, { axiosInstance } from '../api';

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         console.log("User is signed in:", user);
//         const token = await user.getIdToken();
//         localStorage.setItem(TOKEN_NAME, token);
//         // now safe to redirect
//     }
// });

onIdTokenChanged(auth, async (user) => {
    if (user) {
        const token = await user.getIdToken(); // Firebase will refresh when ready
        localStorage.setItem(TOKEN_NAME, token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
});


export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const token = await user.getIdToken(true); // Firebase ID token
        // simulate a sleep for 1 second
        await new Promise(resolve => setTimeout(resolve, 5000));
        return { token };
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