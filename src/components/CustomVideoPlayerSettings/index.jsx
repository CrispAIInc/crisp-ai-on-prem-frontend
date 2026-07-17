import React, { useContext } from 'react';

import BaseHeading from "../BaseHeading";
import ToggleSwitch from '../ToggleSwitch';
import { MainContext } from '../../contexts/mainContext';

function CustomVideoPlayerSettings({
    areChaptersVisible,
    setAreChaptersVisibile,
    areHighlightsVisible,
    setAreHighlightsVisibile,
}) {

    const {
        theme
    } = useContext(MainContext);

    return (
        <div className={`p-2 rounded-xl shadow-md backdrop-blur-sm ${theme === 'light' ? 'bg-white/60 text-textColor-300 !border !border-textColor-200' : 'bg-textColor-300/60 !border !border-textColor-200/20'} flex flex-col gap-3`}>

            {/* SHOW/HIDE CHAPTERS */}
            <div className="flex items-center justify-content-sm-between">
                <BaseHeading text="Show chapters" />
                <ToggleSwitch value={areChaptersVisible} onChange={() => setAreChaptersVisibile(v => !v)} />
            </div>

            {/* SHOW/HIDE HIGHLIGHTS */}
            <div className="flex items-center justify-content-sm-between">
                <BaseHeading text="Show highlights" />
                <ToggleSwitch value={areHighlightsVisible} onChange={() => setAreHighlightsVisibile(v => !v)} />
            </div>
        </div>
    );
}

export default CustomVideoPlayerSettings;