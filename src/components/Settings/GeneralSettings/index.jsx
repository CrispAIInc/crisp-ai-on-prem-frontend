import { useContext, useState } from 'react';
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

    const formatFieldLabel = (key) => key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (char) => char.toUpperCase());

    const renderSettingRow = (label, value, onChange, disabled = false) => (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-[120px]">
                <h4 className={`text-sm font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>
                    {label}
                </h4>
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                className={`w-full max-w-[240px] h-9 px-3 placeholder-transparent bg-transparent focus:outline-none focus:border-blue-500 rounded-xl ${theme === "light"
                    ? "text-textColor-300 !border !border-textColor-100/60"
                    : "text-textColor-100 !border !border-textColor-200/20"
                    } disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed`}
                disabled={disabled}
            />
        </div>
    );

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
        <div className="w-[90%] mx-auto space-y-4">
            {
                error === false ? (
                    <Alert className="w-full mx-auto lg:w-1/2" severity='info'>Verification email sent! Check out your inbox.</Alert>
                ) : typeof error === 'string' ? (
                    <Alert className="w-full mx-auto lg:w-1/2" severity="error" onClose={() => setError(null)}>{error}</Alert>
                ) : null
            }

            {!hideTheme && (
                <section className={`rounded-2xl p-4 shadow-sm ${theme === "light" ? "!border !border-gray-200/50 bg-white/80" : "!border !border-textColor-200/20 bg-textColor-300/70"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className={`text-[15px] font-semibold ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>
                                Appearance
                            </h3>
                            <p className={`mt-1 text-sm ${theme === "light" ? "text-gray-500" : "text-textColor-100/80"}`}>
                                Personalize how the app looks and feels.
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </section>
            )}

            <section className={`rounded-2xl p-4 shadow-sm ${theme === "light" ? "!border !border-gray-200/50 bg-white/80" : "!border !border-textColor-200/20 bg-textColor-300/70"}`}>
                <div>
                    <h3 className={`text-[15px] font-semibold ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>
                        Profile
                    </h3>
                    <p className={`mt-1 text-sm ${theme === "light" ? "text-gray-500" : "text-textColor-100/80"}`}>
                        Update your personal details and keep your account verified.
                    </p>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    {Object.entries(user ?? {}).map(([key, value]) => {
                        if (key === "emailVerified" && !value) {
                            return (
                                <p key={key} className={`text-[10px] text-orange-400 cursor-pointer border-b border-b-transparent hover:border-b hover:border-b-orange-400 w-fit font-medium flex gap-1 items-center`} onClick={sendVerificationEmail}>
                                    {isSendingEmailPending ? <LoadingSpinner isSmall /> : <WarningAmberOutlinedIcon className='' />}
                                    <span>Verify your account!</span>
                                </p>
                            );
                        }

                        if (key === "emailVerified" || key === "userId") return null;

                        return (
                            <div key={key}>
                                {renderSettingRow(
                                    formatFieldLabel(key),
                                    value,
                                    (e) => handleChange(key, e.target.value),
                                    key === "email"
                                )}
                            </div>
                        );
                    })}

                    {isUserInfoChanged && (
                        <RippleButton cssClasses="flex items-center py-2 pl-2 !pr-3 gap-2 self-end mt-2">
                            <span>Save changes</span>
                        </RippleButton>
                    )}
                </div>
            </section>

            <section className={`rounded-2xl p-4 shadow-sm ${theme === "light" ? "!border !border-gray-200/50 bg-white/80" : "!border !border-textColor-200/20 bg-textColor-300/70"}`}>
                <div>
                    <h3 className={`text-[15px] font-semibold ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>
                        Preferences
                    </h3>
                    <p className={`mt-1 text-sm ${theme === "light" ? "text-gray-500" : "text-textColor-100/80"}`}>
                        Choose how videos play while you browse your content.
                    </p>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    <div className={`shadow-sm flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${theme === 'light' ? '!border !border-gray-200/50' : '!border !border-textColor-200/20'}`}>
                        <div>
                            <h4 className={`text-sm font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>Autoplay videos</h4>
                            <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-textColor-100/70"}`}>Play videos automatically as you move through content.</p>
                        </div>
                        <ToggleSwitch value={generalSettings.video_autoplay} onChange={(val) => handleSettingsChange("video_autoplay", val)} />
                    </div>
                    <div className={`shadow-sm flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${theme === 'light' ? '!border !border-gray-200/50' : '!border !border-textColor-200/20'}`}>
                        <div>
                            <h4 className={`text-sm font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>Loop videos</h4>
                            <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-textColor-100/70"}`}>Repeat videos continuously when they finish playing.</p>
                        </div>
                        <ToggleSwitch value={generalSettings.video_loop} onChange={(val) => handleSettingsChange("video_loop", val)} />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default GeneralSettings;