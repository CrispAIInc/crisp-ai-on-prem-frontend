import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export default function useFirebase() {

    async function getPublicUrl(gsUrl) {

        // Extract everything after the bucket name
        const bucket = "gs://crispai-app-462614.firebasestorage.app/";
        const path = gsUrl.replace(bucket, ""); // "img_uploads/imgs/finance/59343.jpg"

        try {
            const fileRef = ref(storage, path);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error);
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