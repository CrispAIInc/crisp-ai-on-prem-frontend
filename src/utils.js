export function parseHtmlToText(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');

    return doc.body.textContent;
}

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

export function isNoteFull(noteTextArray) {
    return noteTextArray.some((item) => item.content !== '' && item.content !== '<p><br></p>');
}