export function parseHtmlToText(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');

    return doc.body.textContent;
}