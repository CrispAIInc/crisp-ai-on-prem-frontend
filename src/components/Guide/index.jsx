import React, { useEffect } from 'react';
import Joyride from 'react-joyride';

import './guide.css';

const Guide = ({ steps, tabIdentifier }) => {
    const [run, setRun] = React.useState(true);
    const [stepIndex, setStepIndex] = React.useState(0);

    const handleStepChange = (event) => {
        console.log('Step Change Event:', event); // Debugging the event

        // Only handle step changes
        if (event.type === 'step:after' || event.type === 'tour:end') {
            if (event.status === 'finished' || event.status === 'skipped') {
                setRun(false);
                localStorage.setItem(`guide_completed_${tabIdentifier}`, 'true');
            } else {
                setStepIndex(event.index + 1); // Update step index only on valid steps
            }
        }
    };

    useEffect(() => {
        setStepIndex(0); // Reset to first step when tab changes
        setRun(true); // Restart guide when switching tabs
    }, [tabIdentifier]);

    return (
        <Joyride
            run={run}
            steps={steps}
            stepIndex={stepIndex}
            callback={handleStepChange}
            continuous // Allows the next step to be shown automatically
            showSkipButton // Optionally show a skip button
            showProgress
            disableScrollParentFix={true}
            styles={{
                options: {
                    arrowColor: "#5293FD",
                    backgroundColor: "#5293FD",
                    overlayColor: "rgba(82, 147, 253, 0.1)",
                    primaryColor: "#5293FD",
                    textColor: "#fff",
                    zIndex: 1000,
                },
                spotlight: {
                    borderRadius: '8px', // Add rounded corners to the spotlight
                    boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)', // Subtle shadow effect
                    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Spotlight color to highlight the element
                },
                buttonNext: {
                    outline: "none",
                },
                tooltipContainer: {
                    maxWidth: '300px', // Ensure it doesn't overflow
                    wordWrap: 'break-word',
                },
                tooltip: {
                    whiteSpace: 'normal',
                },
            }}
        />
    );
};

export default Guide;
