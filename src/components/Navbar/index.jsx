import { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeContext.js';
import { Link } from 'react-router-dom';
import LinkButton from '../LinkButton/index.jsx';

const NAVBAR_LINKS = [
    {
        name: "Login",
        href: "#"
    },
    {
        name: "Sign Up",
        href: "#"
    }
];

export default function Navbar() {
    const { theme } = useContext(ThemeContext);

    return (
        <nav className="flex items-center justify-between gap-1 py-2">
            {/* logo section */}
            {/* <div className='flex items-center gap-2'>
                <img src="/crisp-ai-logo.png" alt="Crisp-ai logo" className="w-12 h-12" width="48" height="48" />
                <p className={`font-sans text-xl font-extrabold text-center user-select-none ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Crisp AI</p>
            </div> */}
            {/* <div className="flex items-center gap-3">
                {
                    NAVBAR_LINKS.map(({ name, href }) => (
                        <LinkButton key={name} name={name} href={href} hasBackground={name === NAVBAR_LINKS[1].name} />
                    ))
                }
            </div> */}
        </nav>
    );
}