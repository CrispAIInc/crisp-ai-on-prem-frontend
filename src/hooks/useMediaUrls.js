import { useCallback } from "react";

export default function useMediaUrls() {
    const getPublicUrl = useCallback(async (url) => {
        if (!url) return null;
        if (typeof url !== "string") {
            throw new Error("The API must provide media URLs as strings.");
        }
        if (url.startsWith("gs://")) {
            throw new Error("The API must provide a direct media URL instead of a gs:// URI.");
        }
        return url;
    }, []);

    return {
        getPublicUrl,
        getDownloadableUrl: getPublicUrl,
    };
}
