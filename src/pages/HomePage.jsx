import BaseHeading from '../components/BaseHeading';

export default function HomePage({ theme }) {
    return (
        <div className="h-full bg-background_workspace main-workspace-container">
            {/* logo */}
            <div className="flex flex-col items-center justify-center mt-2">
                <img src="/app-logo.svg" alt="logo" className="w-24 h-24" width="96" height="96" />
                <p className={`font-sans font-extrabold text-5xl text-center user-select-none ${theme === 'dark' ? 'text-textColor-100' : 'text-textColor-300'}`}>Crisp AI</p>
            </div>
            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                } text-center text-2xl mt-10 w-[600px] max-w-[90vw] mx-auto !my-10`}>First of its kind platform for Creation of interactive Stories based on facts from your Multi-Modal Knowledge Base.</p>

            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                } text-center text-lg font-bold mt-10 w-[600px] max-w-[90vw] mx-auto`}>Stay tuned for details.</p>

        </div>
    );
}