
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function MetadataVerbosity({ isFromReel = false, verbosityValue, setVerbosityValue, disabilityLevel = 10 }) {

    const { theme } = useContext(MainContext);

    return (
        <>
            <style>
                {
                    `
                    .MuiTypography-root {
                        font-size: 13px !important;
                    }
                    .MuiButtonBase-root {
                    padding-right: 1px!important;   
                }}
                    `
                }
            </style>
            <FormControl>
                {/* <FormLabel id="demo-row-radio-buttons-group-label" className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Verbosity</FormLabel> */}
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={verbosityValue}
                    onChange={setVerbosityValue}
                >
                    {(isFromReel ? ["Short (1min)", "Medium (1.5min)", "Long (2min)"] : ["Low", "Medium", "High"]).map((level, index) => (
                        <FormControlLabel key={index} value={level} control={<Radio />} label={level} className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} ${isFromReel && "!text-xs"}`} />
                    ))}
                </RadioGroup>
            </FormControl>
        </>
    );
}
