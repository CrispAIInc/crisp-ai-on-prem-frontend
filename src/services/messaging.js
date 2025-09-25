import { sendEmailVerification } from "firebase/auth";

export const sendEmail = async (user) => {
    try {
        await sendEmailVerification(user);
    } catch (error) {
        throw new Error("Failed to send verification email. Please try again.");
    }
};