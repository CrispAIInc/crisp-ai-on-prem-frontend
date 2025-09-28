// /pages/verify.jsx  (or /verify route)
import { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { useRouter } from "next/router";

export default function VerifyPage() {
    const router = useRouter();
    const [status, setStatus] = useState("processing"); // processing | success | not-signed-in | error
    const auth = getAuth();

    useEffect(() => {
        if (!router.isReady) return;

        (async () => {
            const params = new URLSearchParams(window.location.search);
            const mode = params.get("mode");
            const oobCode = params.get("oobCode");

            if (mode !== "verifyEmail" || !oobCode) {
                setStatus("error");
                return;
            }

            try {
                // Apply the action code (verifies the email in Firebase Auth)
                await applyActionCode(auth, oobCode);

                // if user is signed in, refresh and notify backend
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    const idToken = await auth.currentUser.getIdToken(true); // force refresh
                    // notify backend to update DB
                    await fetch("/api/mark-verified", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({}),
                    });

                    setStatus("success");
                    router.replace("/app"); // or wherever the main app is
                } else {
                    // not signed in: redirect to login with a flag so the login page can show a verified message
                    setStatus("not-signed-in");
                    router.replace("/login?verified=true");
                }
            } catch (err) {
                console.error("Verification failed:", err);
                setStatus("error");
            }
        })();
    }, [router.isReady]);

    if (status === "processing") return <div>Verifying your email...</div>;
    if (status === "success") return <div>Email verified — redirecting...</div>;
    if (status === "not-signed-in") return <div>Email verified. Please sign in.</div>;
    return <div>Invalid or expired verification link. Try requesting a new verification email.</div>;
}
