
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function MetadataVerbosity({ verbosityValue, setVerbosityValue, disabilityLevel = 10 }) {

    const { theme } = useContext(MainContext);

    return (
        <FormControl>
            {/* <FormLabel id="demo-row-radio-buttons-group-label" className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Verbosity</FormLabel> */}
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={verbosityValue}
                onChange={setVerbosityValue}
            >
                {["low", "medium", "high"].map((level, index) => (
                    <FormControlLabel key={index} disabled={index >= disabilityLevel} value={level} control={<Radio />} label={level} className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`} />
                ))}
            </RadioGroup>
        </FormControl>
    );
}
