const BaseHeading = ({ text, className = '' }) => {
    return (
        <p className={`m-0 text-sm font-semibold text-textColor-200 ${className}`}>{text}</p>
    );
};

export default BaseHeading;