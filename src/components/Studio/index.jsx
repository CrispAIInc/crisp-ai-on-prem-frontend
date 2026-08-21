import { useContext } from 'react';
import { NAV_ITEMS } from '../../navigation/navitems';
import { MainContext } from '../../contexts/mainContext';

function Studio() {

    const {
        activeTab
    } = useContext(MainContext);

    const activeItem = NAV_ITEMS.find(
        (item) => item.key === activeTab
    );

    const ActiveComponent = activeItem?.component;

    return (
        <div className="max-w-[1400px] mx-auto h-full">
            <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start bg-green-600">
                <p>Left</p>
                <div className="h-full">
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </div>
        </div>
    );
}

export default Studio;