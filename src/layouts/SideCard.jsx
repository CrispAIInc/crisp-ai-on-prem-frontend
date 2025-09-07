import { useContext } from 'react';
import { MainContext } from "../../contexts/mainContext.jsx";

function SideCard({ children, onClick }) {
    const { theme } = useContext(MainContext);
    return (
        <div
            className={`p-2 ${theme === 'light' ? 'bg-white' : 'bg-background_workspace'} rounded-md shadow-[0_0px_8px_0px_rgba(0,0,0,0.15)] cursor-pointer user-select-none max-w-full`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export default SideCard;