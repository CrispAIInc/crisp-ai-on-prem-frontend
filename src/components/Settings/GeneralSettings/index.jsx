import React, { useContext, useState } from 'react';
import ThemeToggle from '../../ThemeToggle';
import { MainContext } from '../../../contexts/mainContext';
import { AuthContext } from '../../../contexts/authContext';
import { SettingsContext } from "../../../contexts/settingsContext";
import RippleButton from '../../RippleButton';
import ToggleSwitch from '../../ToggleSwitch';

function GeneralSettings() {
    const { theme } = useContext(MainContext);
    const { user, setUser } = useContext(AuthContext);
    const { generalSettings, setGeneralSettings } = useContext(SettingsContext);

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
    };

    return (
        <div>
            <div className="flex flex-col gap-5">
                {/* app theme switcher */}
                <div className="flex items-center justify-between">
                    <h3 className={`text-[15px] ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}>Theme</h3>
                    <ThemeToggle />
                </div>

                {/* user info */}
                <div className="flex flex-col gap-2">
                    {/* single user info */}
                    {
                        Object.entries(user).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <h3 className={`text-[15px] ${theme === "light"
                                    ? "text-textColor-300"
                                    : "text-textColor-100"
                                    }`}>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                                {
                                    typeof value !== "boolean" ? (
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            className={`w-60 h-8 px-3 placeholder-transparent bg-transparent  focus:outline-none focus:border-blue-500 rounded-full border border-textColor-100 ${theme === "light"
                                                ? "text-textColor-300"
                                                : "text-textColor-100"
                                                }`}
                                        // style={{
                                        //     padding: "6px",
                                        //     border: "1px solid #ccc",
                                        //     borderRadius: "5px",
                                        //     width: "250px",
                                        // }}
                                        />
                                    ) : (
                                        <p className={`text-[15px] ${value ? "text-green-600" : "text-red-600"}`}>{value ? "Verified" : 'Not verified'}</p>
                                    )
                                }
                            </div>
                        ))
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