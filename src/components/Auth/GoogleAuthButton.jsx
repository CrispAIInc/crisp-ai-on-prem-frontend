import { useNavigate } from 'react-router';
import { signInWithGoogle } from '../../services/auth.js';
import { TOKEN_NAME } from '../../globals.js';

function GoogleAuthButton() {

    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            const { token } = await signInWithGoogle();
            localStorage.setItem(TOKEN_NAME, token);

            navigate('/');
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

export default GoogleAuthButton;
