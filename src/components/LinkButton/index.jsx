import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../contexts/themeContext';

export default function LinkButton({ name, href, hasBackground = true, className }) {
    const { theme } = useContext(ThemeContext);

    return (
        <Link key={name} to={href} className={`${theme === "light"
            ? "text-textColor-300"
            : "text-slate-100"
            } text-medium ${hasBackground && 'py-1 px-3 rounded-md bg-blue-500 text-white'} ${className}`}>{name}</Link>
    );
}