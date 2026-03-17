import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';

function CharacterCard({ character, source }) {

    const {
        theme,
        contentPanelContainerRef
    } = useContext(MainContext);

    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    const segments =
        character.text_content
            ?.split("\n")
            .filter(Boolean)
            .map(line => {
                const match = line.match(/\[(.*?)\]\s*(.*)/);
                return match
                    ? { time: match[1], text: match[2] }
                    : { time: "", text: line };
            }) || [];

    return (
        <div className={`shadow-md ${theme === "light"
            ? "!border !border-textColor-100/30 text-textColor-200"
            : "!border !border-textColor-200/30 text-textColor-100"} rounded-xl p-2`}>

            {/* Header */}
            <div className="flex items-center justify-between mb-1">

                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full text-xs p-2 text-white flex items-center justify-center font-semibold ${theme === "light" ? "bg-[linear-gradient(90deg,#a99df2,#d992b1)]" : "bg-[linear-gradient(90deg,#755bea,#b76894)]"}`}>
                        {character.character_name.charAt(0).toLowerCase()}{character.character_name.split(' ')[1]?.charAt(0).toLowerCase()}
                    </div>

                    <span className={`${theme === "light" ? 'text-textColor-300' : 'text-white'} font-medium text-[11px]`}>
                        {character.character_name}
                    </span>
                </div>

                {/* Status badges */}
                <div className="flex gap-2">

                    <span className={`px-2 py-1 text-xs rounded ${!character.detected ? "bg-emerald-500/20 text-emerald-500" : "bg-neutral-600/40 text-neutral-500"}`}>
                        {!character.detected && "Not"} detected
                    </span>

                    {character.talking ? (
                        <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-500">
                            speaking
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs rounded bg-neutral-600/40 text-neutral-500">
                            silent
                        </span>
                    )}

                </div>

            </div>

            {/* Dialogue */}

            {segments.length > 0 ? (

                <div className="">

                    {segments.map((seg, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl p-2 ${theme === "light"
                                ? "!border !border-textColor-100/30 text-textColor-200"
                                : "!border !border-textColor-200/30 text-textColor-100"}`}
                            onClick={(event) => handleSourceLinkClick(event, { ...source, timestamp: seg.time?.split('-')[0] || source?.timestamp || "00:00:00" })}
                        >

                            {seg.time && (
                                <div className="cursor-pointer w-fit text-xs text-indigo-500 mb-1">
                                    {seg.time}
                                </div>
                            )}

                            <div className="text-sm ">
                                {seg.text}
                            </div>

                        </div>
                    ))}

                </div>

            ) : (

                <div className="text-sm text-neutral-400 italic">
                    Character detected but not speaking in this segment
                </div>

            )}

        </div>
    );
}

export default CharacterCard;