
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormControl from '@mui/material/FormControl';
// import { useContext } from 'react';
// import { MainContext } from '../../contexts/mainContext.jsx';

// export default function MetadataVerbosity({ isFromReel = false, verbosityValue, setVerbosityValue, }) {

//     const { theme } = useContext(MainContext);

//     return (
//         <>
//             <style>
//                 {
//                     `
//                     .MuiTypography-root {
//                         font-size: 13px !important;
//                     }
//                     .MuiButtonBase-root {
//                     padding-right: 1px!important;   
//                 }}
//                     `
//                 }
//             </style>
//             <FormControl>
//                 {/* <FormLabel id="demo-row-radio-buttons-group-label" className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Verbosity</FormLabel> */}
//                 <RadioGroup
//                     row
//                     aria-labelledby="demo-row-radio-buttons-group-label"
//                     name="row-radio-buttons-group"
//                     value={verbosityValue}
//                     onChange={setVerbosityValue}
//                     className={`!flex !flex-wrap !gap-0`}
//                 >
//                     {(isFromReel ? ["Short (1m)", "Medium (1.5m)", "Long (2m)"] : ["Low", "Medium", "High"]).map((level, index) => (
//                         <FormControlLabel key={index} value={level} control={<Radio />} label={level} className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} ${isFromReel && "!mr-3"}`} />
//                     ))}
//                 </RadioGroup>
//             </FormControl>
//         </>
//     );
// }

import { useState } from "react";
import { METADATA_VERBOSITY_OPTIONS } from '../../globals';



/**
 * MetadataVerbosity — self-contained Low/Medium/High segmented control.
 * Manages its own selected state internally (no `value` prop needed) and
 * reports the pick via `onChange(verbosity)` whenever it changes.
 *
 * Usage:
 *   <MetadataVerbosity onChange={(verbosity) => console.log(verbosity)} />
 */
export default function MetadataVerbosity({ onChange }) {
    const [selected, setSelected] = useState(METADATA_VERBOSITY_OPTIONS[0]);

    const handleSelect = (option) => {
        setSelected(option);
        onChange?.(option);
    };

    return (
        <div className="flex bg-gray-100 rounded-lg p-[3px] gap-0.5 w-fit">
            {METADATA_VERBOSITY_OPTIONS.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    aria-pressed={selected === option}
                    className={`px-4 py-1 rounded-md text-[11px] font-semibold transition-colors ${selected === option ? "bg-white text-primary-200 shadow-sm2" : "text-ink-secondary hover:text-ink"
                        }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
