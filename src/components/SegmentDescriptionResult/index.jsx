import React, { useContext } from 'react';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BaseHeading from '../BaseHeading';
import RippleButton from "../RippleButton";
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

const SegmentDescriptionResult = ({ exportFn, start = "00:00:00", end = "00:10:00", description = "" }) => {

    const { theme } = useContext(MainContext);
    const { notify } = useToast();

    function copyToClipboard() {
        const textToCopy = `Segment: ${start} - ${end}\nDescription: ${description}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                notify({
                    variant: "info",
                    heading: "Description copied to clipboard!"
                });
            })
            .catch(err => {
                notify({
                    variant: "error",
                    heading: "Failed to copy description to clipboard!",
                    subheading: err?.message || ""
                });
            });
    }

    return (
        <div className={`overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
  backdrop-blur-sm`}>
            <div className="flex items-center gap-2">
                <AccessTimeOutlinedIcon className="text-gray-500" />
                <BaseHeading text={`${start} - ${end}`} className="text-sm " />
            </div>
            <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{description}</p>

            {/* action buttons */}
            <div className="flex items-center gap-2 mt-4">
                <RippleButton cssClasses="px-3 py-1 text-sm  rounded" onClick={exportFn}>Export</RippleButton>
                <RippleButton cssClasses="px-3 py-1 text-sm  rounded" noBg onClick={copyToClipboard}>Copy</RippleButton>
            </div>
        </div>
    );
};

export default SegmentDescriptionResult;