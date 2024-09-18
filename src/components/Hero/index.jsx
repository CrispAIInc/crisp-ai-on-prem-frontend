import { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import LinkButton from '../LinkButton';

export default function Hero() {

    const { theme } = useContext(ThemeContext);

    return (
        <div className="flex flex-col items-center justify-center mt-20 relative">
            {/* Mesh gradient */}
            <div className="w-72 h-72 bg-blue-500 rounded-full absolute left-0 top-0 -z-0 blur-[100px]"></div>

            <div className="mb-20 z-1 flex flex-col items-center">
                {/* <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-5xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Interactive story creation made simple, efficient and accurate via <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500'>Multi-Modal</span> content discovery.</p> */}

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-3xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Empowering interactive storytelling for businesses by harnessing AI via multimodal content discovery and transforming to clear, engaging narratives that drive significant business impact.</p>

                {/* <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-slate-100"
                    } text-center font-normal w-[700px] max-w-[90vw] mx-auto !mt-5`}>Empowering interactive storytelling for businesses by harnessing AI via multimodal content discovery and transforming to clear, engaging narratives that drive significant business impact.</p> */}

                {/* <LinkButton name="Get Started" href='#' className="mt-4" /> */}
            </div>

            {/* Mesh gradient */}
            <div className="w-72 h-72 bg-violet-500 rounded-full absolute right-0 top-72 -z-0 blur-[100px]"></div>

            {/* <div className='w-3/4 z-1'>
                <img className="w-full shadow-2xl h-full" src={`crisp-ai-demo-${theme}.png`} />
            </div> */}
        </div>
    );
}