import { useContext } from 'react';
import FaqItem from '../FaqItem';
import { MainContext } from '../../contexts/mainContext';

const Faqs = ({ heading, faqs, chosenLanguage }) => {

    const { theme } = useContext(MainContext);

    return (
        <div className="">
            <h2 className={`mb-6 text-2xl font-bold ${theme === 'dark' && 'text-gray-400'}`}>{heading}</h2>
            <div className="space-y-4">
                {faqs.map((item) => (
                    <FaqItem chosenLanguage={chosenLanguage} key={item.id} item={item} isBoxed />
                ))}
            </div>
        </div>
    );
};

export default Faqs;
