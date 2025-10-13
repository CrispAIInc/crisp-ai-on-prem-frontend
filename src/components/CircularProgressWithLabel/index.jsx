import react, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function CircularProgressWithLabel({ value, variant, isUploadFailed, ...props }) {
    // const [progress, setProgress] = useState(0);
    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    //     }, 1000);

    //     return () => {
    //         clearInterval(intervalId);
    //     };
    // }, []);
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant={variant}
                value={value}
                size={50}
                thickness={3.5}
                sx={{
                    color: isUploadFailed ? "error.main" : "dodgerblue"
                }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: isUploadFailed ? "error.main" : "dodgerblue", fontWeight: "bold" }}
                >
                    {`${Math.round(value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}