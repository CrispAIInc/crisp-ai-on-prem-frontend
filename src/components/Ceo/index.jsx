import { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeContext.js';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export default function Ceo() {
    const { theme } = useContext(ThemeContext);
    return (
        <div className={`bg-background p-3 relative w-2/3 mx-auto shadow-2xl shadow-background}`}>
            <img src="harsha.jfif" className="absolute w-20 h-20 rounded-full -top-10 -left-10 z-1" />
            <FormatQuoteIcon style={{ fontSize: 80, fill: "#5293FD", transform: 'rotate(180deg)' }} />
            <p className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-200'} w-3/4 text-center mx-auto`}>Empowering storytelling for businesses by harnessing AI to transform diverse multi-modal data into clear, engaging narratives that drive significant business impact.</p>
            <div className="flex justify-end">
                <FormatQuoteIcon style={{ fontSize: 80, fill: "#5293FD" }} />
            </div>
            <p className={`${theme === 'dark' && 'text-white'} font-bold text-right mt-4`}>harsha viswanath ~ Crisp AI’s CEO</p>
        </div>
    );
}