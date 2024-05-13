const BaseHeading = ({ text, className = '', onClick }) => {
    return (
        <p className={`m-0 text-sm font-semibold text-textColor-200 ${className}`} onClick={onClick}>{text}</p>
    );
};

export default BaseHeading;