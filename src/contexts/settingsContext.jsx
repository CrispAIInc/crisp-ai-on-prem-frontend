import { createContext, useState } from "react";

export const SettingsContext = createContext();

export default function SettingsProvider({ children }) {
    const [generalSettings, setGeneralSettings] = useState({
        video_autoplay: true,
        video_loop: false,
    });

    return (
        <SettingsContext.Provider value={{ generalSettings, setGeneralSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
