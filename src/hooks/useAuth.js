import { useNavigate } from 'react-router-dom';
import { isUserAuthenticated } from '../services/auth';

export default function useAuth() {
    // This hook can be used to manage authentication state
    // For example, it can return user information, login/logout functions, etc.

    const navigate = useNavigate();

    return {
        isUserAuthenticated,
        login: () => {
            // Implement login logic here
        },
        logout: () => {
            // Implement logout logic here
            localStorage.removeItem('idToken');
            navigate('/login');
        }
    };
}