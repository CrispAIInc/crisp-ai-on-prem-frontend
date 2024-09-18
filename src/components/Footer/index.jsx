import { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeContext';

export default function Footer() {
    const { theme } = useContext(ThemeContext);

    return (
        <footer className='flex flex-wrap items-center justify-between w-full px-10 py-2 bg-background'>
            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                }`}>harsha.viswanath@crisp-ai.com</p>
            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                }`}>© 2024 Crisp AI ~ All right reserved</p>
        </footer>
    );
}