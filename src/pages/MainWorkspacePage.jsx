import MainWorkspace from '../components/MainWorkspace';

export default function MainWorkspacePage({ theme }) {
    return (
        <div className="!h-full">
            <MainWorkspace theme={theme} />
        </div>
    );
}