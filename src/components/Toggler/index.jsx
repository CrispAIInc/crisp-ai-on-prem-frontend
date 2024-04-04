import { useState } from 'react';

const Toggler = ({ components }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleComponent = (index) => {
        setActiveIndex(index);
    };

    return (
        <div className='flex flex-col h-full overflow-y-auto'>
            <div className='flex flex-col md:flex-row items-center justify-center gap-3 mx-auto mt-8 rounded-md mb-7 bg-primary-100/30 w-fit'>
                {components.map((Component, index) => (
                    <button key={index} onClick={() => toggleComponent(index)} className='px-2 py-1 font-medium rounded-md text-textColor-300'>
                        {index === activeIndex ? <span className='bg-white rounded-md py-[4px] px-[5px]'>{Component.props.name}</span> : Component.props.name}
                    </button>
                ))}
            </div>
            {components[activeIndex]}
        </div>
    );
};

export default Toggler;