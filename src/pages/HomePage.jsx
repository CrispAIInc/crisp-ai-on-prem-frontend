export default function HomePage({ theme }) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-background_workspace main-workspace-container ">
            {/* logo */}
            <div className="flex flex-col items-center justify-center mt-2">
                <img src="/app-logo.svg" alt="logo" className="w-24 h-24" width="96" height="96" />
                <p className={`font-sans font-extrabold text-5xl text-center user-select-none ${theme === 'dark' ? 'text-textColor-100' : 'text-textColor-300'}`}>Crisp AI</p>
            </div>
            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                } text-center text-2xl font-bold w-[600px] max-w-[90vw] mx-auto !mt-5`}><span className="text-primary-300">C</span>reation of <span className="text-primary-300">R</span>ooted <span className="text-primary-300">I</span>nteractive <span className="text-primary-300">S</span>tories <span className="text-primary-300">P</span>latform.</p>

            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                } text-center text-2xl font-semibold !mb-20 w-[600px] max-w-[90vw] mx-auto !mt-5`}>Interctive story creation made simple, efficient and accurate via Multi-Modal content discovery.</p>

            <p className={`${theme === "light"
                ? "text-textColor-300"
                : "text-textColor-100"
                } text-center text-lg font-bold mt-10 w-[600px] max-w-[90vw] mx-auto`}>Stay tuned for details...</p>

        </div>
    );
}