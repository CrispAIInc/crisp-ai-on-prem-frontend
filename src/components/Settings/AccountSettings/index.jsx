import React, { useContext } from 'react';
import { MainContext } from "../../../contexts/mainContext";
import RippleButton from "../../RippleButton";

function AccountSettings() {

    const isProd = import.meta.env.VITE_APP_ENV === "production";

    const { theme } = useContext(MainContext);

    const handleDeleteAccount = async () => {
        console.log("deleting acc...");
    };

    return (
        <div className="flex flex-col gap-5">
            {/* delete account */}
            {
                !isProd && (
                    <>
                        <div className={`flex flex-col gap-2 ${theme === 'dark' && 'text-textColor-100'}`}>
                            <h6 className={`mb-0 pb-0`}>Delete my account</h6>
                            <p className={`mb-1  text-md w-full lg:w-1/2 max-w-[90%]`}>Deleting your account will remove all of your assets (e.g. sources, metadata, media, etc.)</p>

                            <RippleButton cssClasses='rounded-md py-2 px-3' onClick={handleDeleteAccount}>Delete account</RippleButton>
                        </div>
                    </>
                )
            }
        </div>
    );
}

export default AccountSettings;