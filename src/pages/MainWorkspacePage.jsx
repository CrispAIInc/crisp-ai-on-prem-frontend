import { useState } from "react";
import { Helmet } from 'react-helmet';
import MainWorkspace from '../components/MainWorkspace';
import WorkspaceAuth from '../components/WorkspaceAuth';

export default function MainWorkspacePage({ theme }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputPassword, setInputPassword] = useState("");

    const handleLogin = () => {
        const correctPassword = "CrispAI$*321";
        if (inputPassword === correctPassword) {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect password!");
        }
    };

    if (isAuthenticated) {
        return <WorkspaceAuth inputPassword={inputPassword} setInputPassword={setInputPassword} handleLogin={handleLogin} />;
    }

    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
                <title>Workspace - Crisp AI</title>
                <meta name="description" content="Crisp AI Workspace to manage and create interactive reports." />
            </Helmet>
            <div className="!h-full">
                <MainWorkspace theme={theme} />
            </div>
        </>
    );
}