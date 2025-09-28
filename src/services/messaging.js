import { sendEmailVerification } from "firebase/auth";

export const sendEmail = async (user) => {
    try {
        console.log(import.meta.env.VITE_FRONTEND_URL);
        const actionCodeSettings = {
            url: `${import.meta.env.VITE_FRONTEND_URL}/verify`,  // 👈 your custom domain + route
            handleCodeInApp: true,               // tells Firebase to redirect into your app
        };

        await sendEmailVerification(user, actionCodeSettings);
    } catch (error) {
        throw new Error("Failed to send verification email. Please try again.");
    }
};