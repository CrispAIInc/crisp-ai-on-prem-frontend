import { useEffect, useState } from 'react';
import useFirebase from "../../hooks/useFirebase.js";

export default function GsFile({ gsUrl, type = "img", alt = "", ...props }) {
    const { getPublicUrl } = useFirebase();

    const [url, setUrl] = useState("");

    useEffect(() => {
        if (!gsUrl) return;
        getPublicUrl(gsUrl).then(setUrl).catch(console.error);
    }, [gsUrl]);

    if (!url) return null;

    // if (type === "video") return <video src={url} controls {...props} />;
    // if (type === "pdf") return <iframe src={url} {...props} />;
    return (<img src={url} alt={alt} {...props} />);
}
