import { useNavigate } from 'react-router-dom';
import { getJwt } from '../services/auth';

export default function useAuth() {
    // This hook can be used to manage authentication state
    // For example, it can return user information, login/logout functions, etc.

    const navigate = useNavigate();

    const token = getJwt();

    return {
        token,
        isAuthenticated: token !== null,
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