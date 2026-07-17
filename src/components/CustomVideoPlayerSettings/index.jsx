import React, { useContext } from 'react';

import BaseHeading from "../BaseHeading";
import ToggleSwitch from '../ToggleSwitch';
import { MainContext } from '../../contexts/mainContext';

function CustomVideoPlayerSettings({
    areChaptersVisible,
    setAreChaptersVisibile,
    areHighlightsVisible,
    setAreHighlightsVisibile,
    playBackRates,
    playbackRate,
    setPlaybackRate,
}) {

    const {
        theme
    } = useContext(MainContext);

    return (
        <div className={`p-2 rounded-xl shadow-md backdrop-blur-sm ${theme === 'light' ? 'bg-white/60 text-textColor-300 !border !border-slate-300/80' : 'bg-textColor-300/60 !border !border-textColor-200/20'} flex flex-col gap-3`}>

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

            {/* SEPARATOR */}
            <div className="h-px bg-white/10" />

            {/* PLAYBACK SPEED */}
            <div className="px-2 pb-1.5">
                {/* <div className="mb-1.5 text-[12px] text-white/70">Speed</div> */}
                <BaseHeading text="Playback speed" className="mb-2" />
                <div className="grid grid-cols-3 gap-1">
                    {
                        playBackRates.map((rate) => (
                            <button
                                key={rate}
                                onClick={() => setPlaybackRate(rate)}
                                className={`rounded-md px-1.5 py-1 text-[11px] ${playbackRate === rate
                                    ? 'bg-[#755bea] text-white'
                                    : 'bg-white/10 text-white/80 hover:bg-white/10'
                                    }`}
                            >
                                {rate}x
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default CustomVideoPlayerSettings;