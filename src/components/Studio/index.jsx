import Media from '../Media';

function Studio() {
    return (
        <div className="max-w-[1400px] mx-auto h-full">
            <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start bg-green-600">
                <p>Left</p>
                <div className="h-full">
                    <Media />
                </div>
            </div>
        </div>
    );
}

export default Studio;