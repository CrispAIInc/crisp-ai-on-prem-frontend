
import { Box, Slider } from '@mui/material';

const marks = [
    {
        value: 0,
        label: '0',
    },
    {
        value: 0.2,
        label: '0.2',
    },
    {
        value: 0.8,
        label: '0.8',
    },
    {
        value: 1,
        label: '1',
    },
];

const TemperatureSlider = ({ temperatureValue, setTemperatureValue }) => {

    function valuetext(value) {
        return `${value}`;
    }

    return (
        <div className='px-2'>
            <Box sx={{
                width: "100%", // Ensure it takes the full width of its container
                maxWidth: 400, // Optional: Add a max width to prevent overflow
                // margin: "0 auto", // Center it horizontally
                padding: 2, // Add padding to ensure the slider doesn't touch edges
                paddingTop: 0, // Optional: Remove top padding to make it look better
            }}>
                <Slider
                    // aria-label="Always visible"
                    defaultValue={0.2}
                    getAriaValueText={valuetext}
                    step={0.01}
                    marks={marks}
                    valueLabelDisplay="auto"
                    value={temperatureValue}
                    onChange={(e, value) => setTemperatureValue(value)}
                    min={0}
                    max={1}
                    sx={{
                        "& .MuiSlider-markLabel": {
                            font: "",
                        },
                    }}
                />
            </Box>
        </div>
    );
};

export default TemperatureSlider;
