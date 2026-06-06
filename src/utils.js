export function extractSections(outlineText) {
    const sectionRegex = /^(?:####\s*)?(?:\*\*)?(I{1,3}|IV|V|X|IX|C|D|M|VI{1,3}|I{1,3})\.\s+(.+?)(?:\*\*)?$|^\s{3}(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)\.\s+(.+)|^\s{6}(\d+)\.\s+(.+)/gm;
    let match;
    const sections = [];

    while ((match = sectionRegex.exec(outlineText)) !== null) {
        if (match[1]) {
            sections.push(match[1] + ". " + match[2].trim());
        } else if (match[3]) {
            sections.push(match[3] + ". " + match[4].trim());
        } else if (match[5]) {
            sections.push(match[5] + ". " + match[6].trim());
        }
    }

    return sections;
}

export function extractTitle(responseString) {
    // Regular expression to match the title of the outline
    const titleRegex = /(\*\*Outline.*?\*\*)|(### Outline.*)|(Outline.*)|(\*\*Title.*?\*\*)/;
    const match = responseString.match(titleRegex);

    if (match) {
        return match[0] || match[1];
    } else {
        return null;
    }
}

export function getLevelOfSection(section) {
    const indicator = section.split('. ')[0];
    if (isRomanNumber(indicator)) return 4;
    if (isNumber(indicator) || !isNaN(indicator)) return 6;
    if (isString(indicator)) return 5;
}

export function getLevelOfSectionInGenStories(section) {
    const indicator = section.split('. ')[0];
    if (isRomanNumber(indicator)) return 6;
    if (isNumber(indicator) || !isNaN(indicator)) return -1;
    if (isString(indicator)) return 6;
}

export function isRomanNumber(string) {
    return /^(?=[MLXVI])M{0,4}(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(string);
}

export function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

export function isString(value) {
    return typeof value === 'string';
}

export function generateRandomHash(length) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$%!§?@|';
    let hash = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        hash += characters[randomIndex];
    }
    return hash;
}

export const toBase64 = async file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

export function transformArrayOfObjectsToArray(arr) {
    return arr.map(item => item.outline.name);
}

export function timeToSeconds(time) {
    const parts = time.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    return hours * 3600 + minutes * 60 + seconds;
}

export function formatDuration(seconds) {
    seconds = Math.floor(seconds);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];

    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (remainingSeconds > 0 || parts.length === 0)
        parts.push(`${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`);

    return parts.join(' ');
}

export function decimalSecondsToHHMMSS(decimalSeconds) {
    const hours = Math.floor(decimalSeconds / 3600);
    const minutes = Math.floor((decimalSeconds % 3600) / 60);
    const seconds = Math.floor(decimalSeconds % 60);

    const pad = (num) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


export function flattenMetadata(obj) {
    const { metadata, ...rest } = obj;
    const flattenedMetadata = {};

    if (metadata) {
        // Flatten chapters
        if (metadata.chapters) {
            flattenedMetadata.chapters = {
                title: metadata.chapters.title,
                content: metadata?.chapters?.content?.map(chapter => ({ ...chapter })),
            };
        }

        // Flatten FAQs
        if (metadata.faqs) {
            flattenedMetadata.faqs = {
                title: metadata.faqs.title,
                content: metadata?.faqs?.content?.map(faq => ({ ...faq }))
            };
        }

        // Flatten highlights
        if (metadata.highlights) {
            flattenedMetadata.highlights = {
                title: metadata.highlights.title,
                content: metadata?.highlights?.content?.map(highlight => ({ ...highlight })),
            };
        }

        // Flatten keywords
        if (metadata.keywords) {
            flattenedMetadata.keywords = {
                title: metadata?.keywords?.title,
                content: metadata?.keywords?.content?.map(keyword => ({ ...keyword })),
            };
        }

        // Flatten summary
        if (metadata.summary) {
            flattenedMetadata.summary = {
                id: metadata.summary.id,
                title: metadata.summary.title,
                content: metadata?.summary?.content,
            };
        }

        // Include other metadata keys, if any
        Object.keys(metadata).forEach(key => {
            if (!flattenedMetadata[key] && !['chapters', 'faqs', 'highlights', 'keywords', 'summary'].includes(key)) {
                flattenedMetadata[key] = metadata[key];
            }
        });
    }

    // Combine the flattened metadata with the rest of the object
    return {
        ...rest,
        ...flattenedMetadata,
    };
}

export function htmlToPlainText(input) {
    if (typeof input !== 'string') return '';

    // Quick check: if it doesn't look like HTML, return as-is
    const isProbablyHtml = /<\/?[a-z][\s\S]*>/i.test(input);
    if (!isProbablyHtml) return input.trim();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = input;

    // Replace <br> with newline
    tempDiv.querySelectorAll('br').forEach(br => {
        const newline = document.createTextNode('\n');
        br.parentNode.replaceChild(newline, br);
    });

    // Add newline after each <p> unless it's the last one
    tempDiv.querySelectorAll('p').forEach((p, index, all) => {
        if (index !== all.length - 1) {
            p.innerHTML += '\n';
        }
    });

    return tempDiv.textContent.trim();
}

export const isRtlLanguage = (langCode) => ["ar", "iw", "fa", "ur", "ps", "sd"].includes(langCode);

export function sortStrings(arr, ascending = true) {
    return [...arr].sort((a, b) =>
        ascending
            ? a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
            : b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
    );
}

export function pluck(arr, key) {
    return arr.map(obj => obj?.[key]);
}

export function sortArrayOfObjects(data, key) {
    return [...data].sort((a, b) => {
        const pathA = a[key] || "";
        const pathB = b[key] || "";
        return pathA.localeCompare(pathB, undefined, {
            numeric: true,
            sensitivity: "base",
        });
    });
}

// Sort by source_path
export function sortBySourcePath(data) {
    return [...data].sort((a, b) => {
        const pathA = a.metadata?.source_path || "";
        const pathB = b.metadata?.source_path || "";
        return pathA.localeCompare(pathB, undefined, {
            numeric: true,
            sensitivity: "base",
        });
    });
}

// Search by source_path
export function searchByKey(data, key, query) {
    return data.filter((item) => {
        const path = item[key] || "";
        return path.toLowerCase().includes(query.toLowerCase());
    });
}

// sort an object by key
export function sortByKey(data, key) {
    return [...data].sort((a, b) => {
        const keyA = a[key] || "";
        const keyB = b[key] || "";
        return keyA.localeCompare(keyB, undefined, {
            numeric: true,
            sensitivity: "base",
        });
    });
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// pick specific keys from an object
export const pick = (obj, keys) =>
    keys.reduce((acc, key) => {
        if (obj[key] !== undefined) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});

export function isValidEmail(email) {
    // Regular expression for a basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// return file type (video, img, pdf, msword, ppt, excel, audio, txt, other) based on mime type
export function getFileType(mimeType) {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'img';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'msword';
    if (mimeType === 'application/vnd.ms-powerpoint' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'ppt';
    if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'excel';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'text/plain') return 'txt';
    return 'other';
}

export function formatReadableDate(value) {
    let date;

    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'string') {
        date = new Date(value);
    } else {
        throw new Error('Invalid date input type');
    }

    if (isNaN(date)) {
        throw new Error(`Invalid date value: ${value}`);
    }

    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    return date.toLocaleString('en-US', options).replace(',', ' –');
}


/**
 * Group or format chat history items into date buckets: Today, Yesterday, Last week, Older
 *
 * @param {Array<Object>} items - array of chat objects. Each object should contain a date field (see dateKey).
 * @param {Object} opts
 * @param {string} [opts.dateKey='created_at'] - property name to read date from when present on item.
 * @param {boolean} [opts.returnAsArray=true] - whether to return an ordered array of groups (useful for rendering) or an object map.
 * @returns {Array|Object} groups either as [{label,key,items}] or { today: [], yesterday: [], lastWeek: [], older: [] }
 */
export function formatChatHistoryByDate(items = [], opts = {}) {
    const { dateKey = 'created_at', returnAsArray = true } = opts;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const groups = {
        today: [],
        yesterday: [],
        lastWeek: [],
        older: []
    };

    const getDateFromItem = (item) => {
        if (!item) return null;
        const raw = item[dateKey] ?? item.timestamp ?? item.createdAt ?? item.date ?? null;
        if (!raw) return null;
        const d = raw instanceof Date ? raw : new Date(raw);
        return isNaN(d) ? null : d;
    };

    for (const item of items) {
        const d = getDateFromItem(item);
        if (!d) {
            groups.older.push(item);
            continue;
        }

        if (d >= startOfToday) groups.today.push(item);
        else if (d >= startOfYesterday) groups.yesterday.push(item);
        else if (d >= startOfWeek) groups.lastWeek.push(item);
        else groups.older.push(item);
    }

    // sort each group descending by date (newest first)
    const sortDesc = (a, b) => {
        const da = getDateFromItem(a) || 0;
        const db = getDateFromItem(b) || 0;
        return db - da;
    };

    Object.keys(groups).forEach(k => groups[k].sort(sortDesc));

    if (!returnAsArray) return groups;

    return [
        { label: 'Today', key: 'today', items: groups.today },
        { label: 'Yesterday', key: 'yesterday', items: groups.yesterday },
        { label: 'Last week', key: 'lastWeek', items: groups.lastWeek },
        { label: 'Older', key: 'older', items: groups.older }
    ];
}

export function generateRandomId(length = 10) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

export function sortByDate(array, dateKey = "created_at", order = "asc") {
    if (!Array.isArray(array)) return [];

    return [...array].sort((a, b) => {
        const dateA = new Date(a[dateKey]).getTime();
        const dateB = new Date(b[dateKey]).getTime();

        if (isNaN(dateA) || isNaN(dateB)) return 0;

        return order === "asc"
            ? dateA - dateB
            : dateB - dateA;
    });
}

export const extractThumbnail = (file) => {
    // const thumbnails = files.map((file) => {
    const type = file.type;
    const preview =
        type.startsWith('image/') || type.startsWith('video/')
            ? URL.createObjectURL(file)
            : null;
    return preview;
    // });
    // setFileThumbnails((prev) => [...prev, ...thumbnails]);
};

export const toSeconds = ({ h, m, s }) =>
    Number(h) * 3600 + Number(m) * 60 + Number(s);

export const fromSeconds = (total) => {
    console.log(total);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    console.log({ hours, minutes, seconds });

    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
    };
};

export const formatTime = ({ h, m, s }) => {
    return `${h}:${m}:${s}`;
};

/**
 * Converts an image URL to a Base64 string
 * @param {string} url - The URL of the image
 * @returns {Promise<string>} - Base64 encoded string (data URL)
 */
export async function urlToBase64(url) {
    try {
        // Fetch the image as a blob
        const response = await fetch(url, { mode: "cors" }); // mode cors for external images
        if (!response.ok) throw new Error("Failed to fetch image");

        const blob = await response.blob();

        // Convert blob to Base64 using FileReader
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // returns data:image/png;base64,...
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.error("Error converting URL to Base64:", err);
        return null;
    }
}

// should return the new timestamp - reducedSeconds
export function reduceSecondsFromTimestamp(timestamp, reducedSeconds) {
    const totalSeconds = timeToSeconds(timestamp);
    const newTotalSeconds = Math.max(0, totalSeconds - reducedSeconds);
    return newTotalSeconds;
}

export function formatTotalSecondsToTimestamp(totalSeconds) {
    const { hours, minutes, seconds } = fromSeconds(totalSeconds);
    return { h: hours, m: minutes, s: seconds };
}

export function randomUUID() {
    return "xxxx-4xxx".replace(
        /[xy]/g,
        function (c) {
            const r = Math.floor(Math.random() * 16);
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}