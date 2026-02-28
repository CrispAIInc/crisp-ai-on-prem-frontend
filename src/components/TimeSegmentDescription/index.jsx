import React, { useContext, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";

import { delay, formatTime, toSeconds } from "../../utils.js";
import { useToast } from '../../contexts/toastContext';

const TimeSegmentDescription = () => {

    const { notify } = useToast();

    const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
    const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });

    const [isPending, setIsPending] = useState(false);
    const [results, setResults] = useState({
        start: formatTime(start),
        end: formatTime(end),
        description: ""
    });

    async function generateDescription() {
        if (toSeconds(end) <= toSeconds(start)) {
            notify({
                variant: "error",
                heading: "Timestamps invalid!",
                subheading: "Your timestamp range is invalid.",
            });
            throw new Error("Timestamps invalid");
        }

        try {
            setIsPending(true);

        } catch (error) {
            console.log(error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col h-full items-center gap-2">
            <SegmentDescription
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                handleGenerate={generateDescription} />

            <SegmentDescriptionResult
                start={results.start}
                end={results.end}
                description={results.description}
                isPending={isPending}
                exportFn={() => {
                    const textToExport = `Segment: ${results.start} - ${results.end}\nDescription: ${results.description}`;
                    const blob = new Blob([textToExport], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "segment-description.txt";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }}
            />
        </div>
    );
};

export default TimeSegmentDescription;