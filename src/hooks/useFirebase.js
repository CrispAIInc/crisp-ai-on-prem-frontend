import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export default function useFirebase() {

    async function getPublicUrl(gsUrl) {

        // Extract everything after the bucket name
        const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET; // "gs://genbook-ai.appspot.com/"
        const path = gsUrl.replace(bucket, ""); // "img_uploads/imgs/finance/59343.jpg"

        try {
            const fileRef = ref(storage, path);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error);
        }
    }

    return {
        getPublicUrl
    };
}