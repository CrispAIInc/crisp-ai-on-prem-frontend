
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function MetadataVerbosity({ verbosityValue, setVerbosityValue }) {

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
                <FormControlLabel value="low" control={<Radio />} label="Low" className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`} />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`} />
                <FormControlLabel value="high" control={<Radio />} label="High" className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`} />
            </RadioGroup>
        </FormControl>
    );
}
