import { useContext } from "react";
import { MainContext } from "../../contexts/mainContext";
import { ExportAssetPdfButton } from '../ExportAllAssetMetadata';

export default function MetadataExportButton() {
    const { currentResource } = useContext(MainContext);

    return (
        <ExportAssetPdfButton
            asset={currentResource}
        />
    );
}
