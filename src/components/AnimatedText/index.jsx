import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function AnimatedText({ text = 'Processing', cssClasses = "" }) {
    const { theme } = useContext(MainContext);
    return (
        <span className={`inline-block`}>
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className={`inline-block text-xs animate-fade-in ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                        } ${cssClasses}`}
                    style={{ animationDelay: `${index * 0.01}s` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
}
