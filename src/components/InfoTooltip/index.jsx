import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

function InfoTooltip({ tooltipText }) {
    const { theme } = useContext(MainContext);

    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative">
            <InfoOutlinedIcon fontSize="10px" style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} onMouseOver={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} />

            {
                showTooltip && (
                    <span className={`inline-block absolute truncate  left-0 z-10 bg-background_workspace text-[12px] p-2  rounded-lg shadow-md top-full ${theme === "light" ? ' text-textColor-200' : 'text-textColor-100'}`}>
                        {tooltipText}
                    </span>
                )
            }
        </div>
    );
}

export default InfoTooltip;