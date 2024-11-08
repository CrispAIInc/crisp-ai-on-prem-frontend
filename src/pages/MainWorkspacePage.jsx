import { Helmet } from 'react-helmet';
import MainWorkspace from '../components/MainWorkspace';

export default function MainWorkspacePage({ theme }) {
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