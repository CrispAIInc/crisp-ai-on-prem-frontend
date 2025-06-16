export default function AnimatedText({ text = 'Searching' }) {
    return (
        <span className="inline-block ">
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className="inline-block animate-fade-in"
                    style={{ animationDelay: `${index * 0.01}s` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
}
