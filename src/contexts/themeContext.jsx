import { createContext, useEffect, useLayoutEffect, useState } from 'react';
import { toastConfig } from 'react-simple-toasts';

export const ThemeContext = createContext({});

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    toastConfig({ theme });

    useLayoutEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        function handleKeyDown(event) {
            // Check if CTRL key and 't' key are pressed simultaneously
            // handle the case for command on mac as well
            if ((event.ctrlKey && event.key === 't') || (event.ctrlKey && event.key === 'T') || (event.metaKey && event.key === 't') || (event.metaKey && event.key === 'T') || (event.metaKey && event.key === 't')) {
                // Call your function here
                setTheme((theme) => theme === 'light' ? 'dark' : 'light');
            }
        }

        // Add event listener when component mounts
        window.addEventListener('keydown', handleKeyDown);

        // Remove event listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <ThemeContext value={{ theme, setTheme }}>
            {children}
        </ThemeContext>);
}