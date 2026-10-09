export const BRAND = {
    primary100: '#D4CCFB',
    primary200: '#A694F3',
    primary300: '#755BEA',
    ink: '#1E1B2E', // near-black with a violet tint, for headings
    body: '#4B4560', // body text
    muted: '#8B85A3', // secondary/meta text
    border: '#E7E2FB',
    tint: '#F7F5FE', // very light card background
    white: '#FFFFFF',
    success: '#1F9D6C',
};

export const PAGE = {
    width: 210,
    height: 297,
    margin: 16,
    contentWidth: 210 - 16 * 2,
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

export function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function setFill(doc, hex) {
    const [r, g, b] = hexToRgb(hex);
    doc.setFillColor(r, g, b);
}

export function setText(doc, hex) {
    const [r, g, b] = hexToRgb(hex);
    doc.setTextColor(r, g, b);
}

export function setDraw(doc, hex) {
    const [r, g, b] = hexToRgb(hex);
    doc.setDrawColor(r, g, b);
}

/** Loads an image from a public path (e.g. '/logo.png') as a base64 data URL,
 *  along with its natural pixel dimensions (needed to preserve aspect ratio). */
export async function loadImageAsDataURL(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Could not load image at ${path}`);
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
    const { width, height } = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = dataUrl;
    });
    return { dataUrl, width, height };
}

/** Formats an ISO/RFC date string into something readable. */
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '—';
    const s = Math.round(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
}