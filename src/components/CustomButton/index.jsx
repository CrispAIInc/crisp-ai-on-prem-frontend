const CustomButton = ({ children, onClick, className, disabled = false }) => {
    return (
        <button
            className={`px-2 py-1 my-6 text-center !w-fit rounded-md cursor-pointer select-sources-container  ${className}`}
            type="button"
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default CustomButton;