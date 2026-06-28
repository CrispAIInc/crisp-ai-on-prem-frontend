import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export default function useFirebase() {

    async function getPublicUrl(gsUrl) {

        if (gsUrl.startsWith('blob') || gsUrl.includes('PDF-file-thumbnail.png')) return gsUrl;

        // Extract everything after the bucket name
        const bucket = import.meta.env.VITE_FIREBASE_PRIVATE_PREFIX;
        const path = gsUrl.replace(bucket, "");

        try {
            const fileRef = ref(storage, path);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error.message);
        }
    }

    async function getDownloadableUrl(gsUrl) {
        const gsReference = ref(storage, gsUrl);
        return await getDownloadURL(gsReference);
    }

    return {
        getPublicUrl,
        getDownloadableUrl
    };
}