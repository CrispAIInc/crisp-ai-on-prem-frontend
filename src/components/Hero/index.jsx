import { useContext, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { ContactFormModal } from '../ContactFormModal';
// import LinkButton from '../LinkButton';

export default function Hero() {

    const { theme } = useContext(ThemeContext);

    const [showContactFormModal, setShowContactFormModal] = useState(false);

    function hideContactFormModal() {
        setShowContactFormModal(false);
    }


    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-5 z-1">

                <div className='flex items-center gap-2'>
                    <img src="/crisp-ai-logo.png" alt="Crisp AI - Interactive Story and Report Creation Platform" className="w-24 h-24" width="64" height="64" />
                    <p className={`font-sans text-5xl font-extrabold text-center user-select-none ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Crisp AI</p>
                </div>

                <h2 className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-3xl font-semibold  w-[900px] max-w-[90vw] mx-auto`}>Did you know that 80% of global enterprise data exists in the form of videos?</h2>

                <p className={`z-1 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-white"
                    } text-center text-lg  w-[900px] max-w-[90vw] mx-auto`}>
                    Yet, only a small fraction of this valuable resource is discoverable today. Why? Because manual labeling processes and even automated approaches that rely solely on audio fall short—they fail to harness the full potential of video data, overlooking the critical visual context. With hundreds of petabytes of videos out there, it&apos;s time for a transformative solution.
                    <br />
                    <br />
                    At <span className="text-xl font-bold">Crisp AI</span>, we&apos;re harnessing the power of Generative AI to unlock the true potential of video data. Our proprietary technology not only automates the discovery process but does so by integrating both audio and visual elements—making it faster, smarter, and cost-effective.
                    <br />
                    <br />
                    But we don&apos;t stop there. Once video data is discoverable, we take it a step further. Crisp AI combines text, visual, and image data  of enterprises to craft compelling narratives and insightful reports—available in 114 languages. This is more than data accessibility; it&apos;s about turning unstructured data into impactful, enterprise-ready stories.
                    <br />
                    <br />
                    We&apos;re on a mission to revolutionize how organizations leverage their vast video and multimodal data, enabling powerful and engaging storytelling at scale.
                    <br />
                    <br />
                    We&apos;re inviting select strategic partners to join us in this journey of discovery and transformation. Together, we can unlock new insights, drive innovation, and shape the future of enterprise data.
                    <br />
                    <br />
                    Are you ready to make an impact? <button className='px-2 py-1 font-semibold rounded-md text-primary-300 text-md' onClick={() => setShowContactFormModal(true)}>Let&apos;s connect.</button>
                </p>
                <ContactFormModal show={showContactFormModal} onHide={hideContactFormModal} />
            </div>
        </div>
    );
}