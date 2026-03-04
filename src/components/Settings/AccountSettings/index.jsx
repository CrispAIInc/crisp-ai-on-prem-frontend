import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MainContext } from "../../../contexts/mainContext";
import RippleButton from "../../RippleButton";
import { AuthContext } from '../../../contexts/authContext';
import { useToast } from "../../../contexts/toastContext";
import makeApiRequest from '../../../api';

import LoadingSpinner from "../../LoadingSpinner";

function AccountSettings() {
    const isProd = import.meta.env.VITE_APP_ENV === "production";

    const navigate = useNavigate();
    const { user, reinitializeUser } = useContext(AuthContext);
    const { theme } = useContext(MainContext);

    const { notify } = useToast();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await makeApiRequest(`/account`, 'DELETE');
            notify({
                variant: "success",
                heading: "Account deleted successfully",
            });

            setTimeout(() => {
                navigate('/sign-up', {
                    state: {
                        accountDeleted: true
                    }
                });
            }, 2000);
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Account deleted successfully",
                subheading: error.message || "Something went wrong while deleting your account."
            });
        } finally {
            setIsDeleting(false);
        }
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

                            <RippleButton cssClasses='rounded-md py-2 px-3' onClick={handleDeleteAccount}>
                                {
                                    isDeleting && <LoadingSpinner cssClasses="mr-2" />
                                }
                                Delete account
                            </RippleButton>
                        </div>
                    </>
                )
            }
        </div>
    );
}

export default AccountSettings;