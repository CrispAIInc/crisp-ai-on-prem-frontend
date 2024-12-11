import { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
// import LinkButton from '../LinkButton';

export default function Hero() {

    const { theme } = useContext(ThemeContext);

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Mesh gradient */}
            {/* <div className="w-72 h-72 bg-blue-500 rounded-full absolute left-0 top-0 -z-0 blur-[100px]"></div> */}

            <div className="flex flex-col items-center gap-5 z-1">
                {/* <img src='/crisp-ai-logo.png' alt="crisp-ai logo" className="w-28 h-28" /> */}
                {/* <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-5xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Interactive story creation made simple, efficient and accurate via <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500'>Multi-Modal</span> content discovery.</p> */}

                <div className='flex items-center gap-2'>
                    <img src="/crisp-ai-logo.png" alt="Crisp AI - Interactive Story and Report Creation Platform" className="w-16 h-16" width="64" height="64" />
                    <p className={`font-sans text-3xl font-extrabold text-center user-select-none ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Crisp AI</p>
                </div>

                <h2 className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-5xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Did you know that 80% of global enterprise data exists in the form of videos?</h2>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-xl  w-[900px] max-w-[90vw] mx-auto`}>Yet, only a small fraction of this valuable resource is discoverable today. Why? Because manual labeling processes and even automated approaches that rely solely on audio fall short—they fail to harness the full potential of video data, overlooking the critical visual context. With hundreds of petabytes of videos out there, it&apos;s time for a transformative solution.</p>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-xl  w-[900px] max-w-[90vw] mx-auto`}>At <span className="font-bold">Crisp AI</span>, we&apos;re harnessing the power of Generative AI to unlock the true potential of video data. Our proprietary technology not only automates the discovery process but does so by integrating both audio and visual elements—making it faster, smarter, and cost-effective.</p>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-xl  w-[900px] max-w-[90vw] mx-auto`}>But we don&apos;t stop there. Once video data is discoverable, we take it a step further. Crisp AI combines text, visual, and image data  of enterprises to craft compelling narratives and insightful reports—available in 114 languages. This is more than data accessibility; it&apos;s about turning unstructured data into impactful, enterprise-ready stories.</p>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-xl  w-[900px] max-w-[90vw] mx-auto`}>We&apos;re on a mission to revolutionize how organizations leverage their vast video and multimodal data, enabling powerful and engaging storytelling at scale.</p>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-xl  w-[900px] max-w-[90vw] mx-auto`}>We&apos;re inviting select strategic partners to join us in this journey of discovery and transformation. Together, we can unlock new insights, drive innovation, and shape the future of enterprise data.</p>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-xl  w-[900px] max-w-[90vw] mx-auto`}>Are you ready to make an impact? Let&apos;s connect.</p>


                {/* <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-3xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Empowering interactive storytelling for businesses by harnessing AI via multimodal content discovery and transforming to clear, engaging narratives that drive significant business impact.</p>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-2xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Stay tuned for more details....</p>
*/}
                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-md font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Contact: harsha.viswanath@crisp-ai.com</p>

                {/* <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-slate-100"
                    } text-center font-normal w-[700px] max-w-[90vw] mx-auto !mt-5`}>Empowering interactive storytelling for businesses by harnessing AI via multimodal content discovery and transforming to clear, engaging narratives that drive significant business impact.</p> */}

                {/* <LinkButton name="Get Started" href='#' className="mt-4" /> */}
            </div>

            {/* Mesh gradient */}
            {/* <div className="w-72 h-72 bg-violet-500 rounded-full absolute right-0 top-72 -z-0 blur-[100px]"></div> */}

            {/* <div className='w-3/4 z-1'>
                <img className="w-full h-full shadow-2xl" src={`crisp-ai-demo-${theme}.png`} />
            </div> */}
        </div>
    );
}