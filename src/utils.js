import _ from 'lodash';

/**
 * Convert a hex color to an RGB formatted string.
 * @param {string} hex - The hex color code (with or without the leading #).
 * @returns {string} The formatted RGB string.
 */
export function hexToRGBString(hex) {
    // Remove the leading '#' if it exists.
    hex = hex.replace(/^#/, '');

    // Check if the hex code is 3 characters long and expand it to 6 characters.
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Ensure the hex code is now 6 characters long.
    if (hex.length !== 6) {
        throw new Error('Invalid hex color code');
    }

    // Extract the RGB components from the hex code.
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Return the formatted RGB string.
    return `rgb(${r},${g},${b})`;
}

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

export function isArrayEqual(x, y) {
    return _(x).xorWith(y, _.isEqual).isEmpty();
}

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

export function decimalSecondsToHHMMSS(decimalSeconds) {
    const hours = Math.floor(decimalSeconds / 3600);
    const minutes = Math.floor((decimalSeconds % 3600) / 60);
    const seconds = Math.floor(decimalSeconds % 60);

    const pad = (num) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}