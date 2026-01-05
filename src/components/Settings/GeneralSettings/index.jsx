import React, { useContext, useState } from 'react';
import ThemeToggle from '../../ThemeToggle';
import { MainContext } from '../../../contexts/mainContext';
import { AuthContext } from '../../../contexts/authContext';
import { SettingsContext } from "../../../contexts/settingsContext";
import RippleButton from '../../RippleButton';
import ToggleSwitch from '../../ToggleSwitch';

import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useNavigate } from 'react-router';
import makeApiRequest from '../../../api';
import { Alert } from '@mui/material';
import LoadingSpinner from '../../LoadingSpinner';
import { logOut } from '../../../services/auth';

function GeneralSettings({ hideTheme = false }) {
    const navigate = useNavigate();
    const { theme } = useContext(MainContext);
    const { user, setUser } = useContext(AuthContext);
    const { generalSettings, setGeneralSettings } = useContext(SettingsContext);
    const [isSendingEmailPending, setIsSendingEmailPending] = useState(false);
    const [error, setError] = useState(null);

    let [isUserInfoChanged, setIsUserInfoChanged] = useState(false);

    const handleChange = (key, value) => {
        setIsUserInfoChanged(true);
        setUser((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSettingsChange = (key, value) => {
        setGeneralSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
        localStorage.setItem('generalSettings', JSON.stringify({
            ...generalSettings,
            [key]: value,
        }));
    };

    async function sendVerificationEmail() {
        try {
            setIsSendingEmailPending(true);
            const { success, message } = await makeApiRequest('/email-otp', 'POST', JSON.stringify({ email: user.email }));

            if (!success) {
                throw new Error(message);
            }

            setError(false);

            setInterval(() => {
                localStorage.setItem('current_project', null);
                logOut();
                navigate('/verify', {
                    state: {
                        email: user.email
                    }
                });
            }, [3000]);
        } catch (error) {
            console.log('Error sending verification email:', error);
            setError(error.message || 'Failed to send verification email. Please try again later.');
        } finally {
            setIsSendingEmailPending(false);
        }
    }

    return (
        <div className="w-[90%] mx-auto">
            <div className="flex flex-col gap-3">
                {
                    error === false ? (
                        <Alert className="w-full mx-auto lg:w-1/2" severity='info'>Verification email sent! Check out your inbox.</Alert>
                    ) : typeof error === 'string' ? (
                        <Alert className="w-full mx-auto lg:w-1/2" severity="error" onClose={() => setError(null)}>{error}</Alert>
                    ) : null
                }
                {/* app theme switcher */}
                {!hideTheme && <div className="flex flex-wrap items-center justify-between">
                    <h3 className={`text-[13px] ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}>Theme</h3>
                    <ThemeToggle />
                </div>}

                {/* user info */}
                <div className="flex flex-col gap-3">
                    {/* single user info */}
                    {
                        Object.entries(user).map(([key, value]) => {
                            if (key !== "emailVerified" && key !== "userId") return (
                                <>
                                    <div key={key} className="flex flex-wrap items-center justify-between">
                                        <h3 className={`text-[13px] ${theme === "light"
                                            ? "text-textColor-300"
                                            : "text-textColor-100"
                                            }`}>{key.charAt(0).toUpperCase() + key.slice(1)}
                                        </h3>
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            className={`w-60 h-8 px-3 placeholder-transparent bg-transparent  focus:outline-none focus:border-blue-500 rounded-full border border-textColor-100 ${theme === "light"
                                                ? "text-textColor-300"
                                                : "text-textColor-100"
                                                } disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                            disabled={key === "email"}
                                        />
                                    </div>
                                </>
                            );
                            else {
                                if (key === "emailVerified" && !value) {
                                    return (
                                        <p key={key} className={`text-[10px] text-orange-400 cursor-pointer border-b border-b-transparent hover:border-b hover:border-b-orange-400 w-fit font-medium flex gap-1 items-center`} onClick={sendVerificationEmail}>
                                            {isSendingEmailPending ? <LoadingSpinner isSmall /> : <WarningAmberOutlinedIcon className='' />}
                                            {/* <span className="text-red-600">Email not verified.</span> */}
                                            <span>Verify your account!</span>
                                        </p>
                                    );
                                }
                            }
                        }
                        )

                    }
                    {isUserInfoChanged && <RippleButton cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2 self-end mt-3">
                        {/* {isPending && <span className="loader-atom"></span>} */}
                        <span>Save changes</span>
                    </RippleButton>}
                </div>

                <hr className={`mx-auto w-1/2 ${theme === "dark" && 'border-textColor-100'}`} />
            </div>

            {/* app settings */}
            <div className="flex items-center justify-between gap-0">
                <h3 className={`text-[15px] ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}>Autoplay videos</h3>
                <ToggleSwitch value={generalSettings.video_autoplay} onChange={(val) => handleSettingsChange("video_autoplay", val)} />
            </div>
            <div className="flex items-center justify-between">
                <h3 className={`text-[15px] ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}>Loop videos</h3>
                <ToggleSwitch value={generalSettings.video_loop} onChange={(val) => handleSettingsChange("video_loop", val)} />
            </div>
        </div>
    );
}

export default GeneralSettings;