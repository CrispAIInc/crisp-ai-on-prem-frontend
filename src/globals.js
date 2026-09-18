export const TOKEN_NAME = "idToken";
export const CURRENT_PROJECT_STORAGE_KEY = "current_project";
export function clearStoredCurrentProject() {
    localStorage.removeItem(CURRENT_PROJECT_STORAGE_KEY);
}
export function readStoredCurrentProject() {
    try {
        const raw = localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY);
        if (raw == null || raw === "null") {
            return null;
        }
        return JSON.parse(raw);
    } catch {
        clearStoredCurrentProject();
        return null;
    }
}
// export const CURRENT_PROJECT_STORAGE_KEY = "current_project";

// export function clearStoredCurrentProject() {
//     localStorage.removeItem(CURRENT_PROJECT_STORAGE_KEY);
// }

// export function readStoredCurrentProject() {
//     try {
//         const raw = localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY);
//         if (raw == null || raw === "null") {
//             return null;
//         }
//         return JSON.parse(raw);
//     } catch {
//         clearStoredCurrentProject();
//         return null;
//     }
// }
export const DEFAULT_TOTAL_PDF_PAGES = 1;
export const VERBOSITY_OPTIONS = ["Low", "Medium", "High"];
export const REEL_VERBOSITY_OPTIONS = ["Short", "Medium", "Long"];
export const MAIN_STUDIO_PANELS = {
    METADATA: "metadata",
    SHORTS: "shorts",
    TIME_SEGMENTS: "time-segments",
    FIND_MOMENTS: "find-moments",
    BUSINESS_INTELLIGENCE: "business-intelligence"
};
export const ANALYTICS_TABS = {
    TIME_SEGMENTS: "time-segments",
    FIND_MOMENTS: "find-moments"
};
export const ENRICH_TABS = {
    METADATA: "metadata",
    BUSINESS_INTELLIGENCE: "business-intelligence"
};