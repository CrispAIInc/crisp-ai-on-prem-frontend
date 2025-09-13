import { createContext, useState } from "react";

export const SettingsContext = createContext();

export default function SettingsProvider({ children }) {
    const [generalSettings, setGeneralSettings] = useState(localStorage.getItem('generalSettings') ? JSON.parse(localStorage.getItem('generalSettings')) : {
        video_autoplay: false,
        video_loop: false,
    });

    return (
        <SettingsContext.Provider value={{ generalSettings, setGeneralSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
