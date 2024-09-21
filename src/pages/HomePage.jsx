import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Container from 'react-bootstrap/Container';
import Ceo from '../components/Ceo';

import { ThemeContext } from "../contexts/themeContext.js";

export default function HomePage({ theme }) {
    return (
        <ThemeContext.Provider value={{ theme }}>
            <div className="bg-background_workspace main-workspace-container !min-h-full">
                <Container>
                    <Navbar />
                    <Hero />
                    {/* <Ceo /> */}
                </Container>
                <Footer />
            </div>
        </ThemeContext.Provider>
    );
}