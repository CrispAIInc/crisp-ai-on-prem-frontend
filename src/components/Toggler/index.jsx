import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

const Toggler = ({ components }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleComponent = (index) => {
        setActiveIndex(index);
    };

    const { theme } = useContext(MainContext);

    return (
        <div className='flex flex-col h-full overflow-y-auto'>
            <div className={`flex flex-col md:flex-row items-center justify-center gap-3 mx-auto mt-8 rounded-md mb-7 ${theme === 'light' ? 'bg-primary-100/30' : 'bg-background_workspace'} w-fit`}>
                {components.map((Component, index) => (
                    <button key={index} onClick={() => toggleComponent(index)} className={`px-2 py-1 font-medium rounded-md ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>
                        {index === activeIndex ? <span className={`${theme === 'light' ? 'bg-white' : 'bg-primary-300'} rounded-md py-[4px] px-[5px]`}>{Component.props.name}</span> : Component.props.name}
                    </button>
                ))}
            </div>
            {components[activeIndex]}

        </div>
    );
};

export default Toggler;