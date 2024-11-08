import { Helmet } from 'react-helmet';
// import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Container from 'react-bootstrap/Container';
// import Ceo from '../components/Ceo';

import { ThemeContext } from "../contexts/themeContext.js";

export default function HomePage({ theme }) {
    return (
        <>
            <Helmet>
                <meta name="robots" content="index, follow" />
                <title>Home - Crisp AI | Build Interactive Stories and Reports</title>
                <meta name="description" content="Crisp AI enables businesses to create interactive reports and stories by extracting factual information from multimodal content." />
            </Helmet>
            <ThemeContext.Provider value={{ theme }}>
                <div className="h-full overflow-hidden bg-background_workspace main-workspace-container">
                    <Container className="flex flex-col items-center justify-center text-center !h-screen">
                        <Navbar />
                        <Hero />
                        {/* <Ceo /> */}
                    </Container>
                    {/* <Footer /> */}
                </div>
            </ThemeContext.Provider>
        </>
    );
}