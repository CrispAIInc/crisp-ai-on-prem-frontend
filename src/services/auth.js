import { signInWithPopup } from 'firebase/auth';
import { TOKEN_NAME } from '../globals';
import { auth, provider } from '../config/firebase';


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