import { useContext, useState } from "react";
import { FileDown } from "lucide-react";
import RippleButton from "../RippleButton";
import { MainContext } from "../../contexts/mainContext";
import { useToast } from "../../contexts/toastContext";
import { exportMetadataToPdf } from "../../utils/exportMetadataPdf";

export default function MetadataExportButton({ metadataType, disabled, buildPayload }) {
    const { currentResource } = useContext(MainContext);
    const { notify } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportMetadataToPdf({
                metadataType,
                sourceTitle: currentResource?.source_path,
                payload: buildPayload(),
            });
        } catch (error) {
            console.error(error);
            notify({
                variant: "error",
                heading: "Export failed",
                subheading: error.message || "Could not generate the PDF. Please try again.",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <RippleButton
            cssClasses="shrink-0 flex items-center gap-1 disabled:cursor-not-allowed p-2"
            disabled={disabled || isExporting}
            onClick={handleExport}
        >
            <FileDown size={14} className={isExporting ? "animate-customPulse" : ""} />
            <span className={`text-sm ${isExporting ? "animate-customPulse" : ""}`}>
                {isExporting ? "Exporting…" : "Export as PDF"}
            </span>
        </RippleButton>
    );
}
