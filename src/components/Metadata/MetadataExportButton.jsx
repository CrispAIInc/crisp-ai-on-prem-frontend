import { useContext, useState } from "react";
import { FileDown } from "lucide-react";
import RippleButton from "../RippleButton";
import { MainContext } from "../../contexts/mainContext";
import { useToast } from "../../contexts/toastContext";
import { exportMetadataToPdf } from "../../utils/exportMetadataPdf";
import { ExportAssetPdfButton } from '../ExportAllAssetMetadata';

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
        <ExportAssetPdfButton
            asset={currentResource}
        />
    );
}
