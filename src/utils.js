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

export function decimalSecondsToHHMMSS(decimalSeconds) {
    const hours = Math.floor(decimalSeconds / 3600);
    const minutes = Math.floor((decimalSeconds % 3600) / 60);
    const seconds = Math.floor(decimalSeconds % 60);

    const pad = (num) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


export function flattenMetadata(obj) {
    console.log(obj);
    const { metadata, ...rest } = obj;
    const flattenedMetadata = {};

    if (metadata) {
        // Flatten chapters
        if (metadata.chapters) {
            flattenedMetadata.chapters = {
                title: metadata.chapters.title,
                content: metadata.chapters.content.map(chapter => ({ ...chapter })),
            };
        }

        // Flatten FAQs
        if (metadata.faqs) {
            flattenedMetadata.faqs = {
                title: metadata.faqs.title,
                content: metadata.faqs.content.map(faq => ({ ...faq }))
            };
        }

        // Flatten highlights
        if (metadata.highlights) {
            flattenedMetadata.highlights = {
                title: metadata.highlights.title,
                content: metadata.highlights.content.map(highlight => ({ ...highlight })),
            };
        }

        // Flatten keywords
        if (metadata.keywords) {
            flattenedMetadata.keywords = {
                title: metadata.keywords.title,
                content: metadata.keywords.content.map(keyword => ({ ...keyword })),
            };
        }

        // Flatten summary
        if (metadata.summary) {
            flattenedMetadata.summary = {
                id: metadata.summary.id,
                title: metadata.summary.title,
                content: metadata.summary.content,
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
