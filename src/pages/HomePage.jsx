import { Helmet } from 'react-helmet';
// import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Container from 'react-bootstrap/Container';
// import Ceo from '../components/Ceo';

import { ThemeContext } from "../contexts/themeContext.js";
// import Timeline from '../components/Timeline';
// import Faqs from '../components/Faqs/index.jsx';

export default function HomePage({ theme }) {
    return (
        <>
            <Helmet>
                <meta name="robots" content="index, follow" />
                <title>Home - Crisp AI | Build Interactive Stories and Reports</title>
                <meta name="description" content="Crisp AI enables businesses to create interactive reports and stories by extracting factual information from multimodal content." />
            </Helmet>
            <ThemeContext.Provider value={{ theme }}>
                <div className="h-full bg-background_workspace">
                    <div className={`w-72 h-72 bg-violet-500 rounded-full absolute left-0  md:left-1/4 top-0 -z-0 blur-[100px]`}></div>
                    <div className={`w-60 h-60 bg-blue-500 rounded-full absolute left-2/4 md:left-2/3 top-72 -z-0 blur-[100px]`}></div>
                    <Container className="flex flex-col items-center text-center">
                        <Navbar />
                        <Hero />
                        {/* <Ceo /> */}
                    </Container>
                    {/* <Footer /> */}
                    {/* <Timeline theme={theme} /> */}
                    {/* <Faqs /> */}

                </div>
            </ThemeContext.Provider>
        </>
    );
}