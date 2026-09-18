import { jsPDF } from "jspdf";
import { htmlToPlainText, urlToBase64 } from "../utils";

const LOGO_PATH = "/new-crips-ai-logo-black-resize.png";

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 12;

const COLORS = {
    primary: [117, 91, 234],
    primaryMid: [166, 148, 243],
    primarySoft: [237, 233, 254],
    ink: [30, 41, 59],
    muted: [100, 116, 139],
    border: [226, 232, 240],
    surface: [248, 250, 252],
    white: [255, 255, 255],
};

const METADATA_LABELS = {
    transcription: "Transcription",
    summary: "Summary",
    chapters: "Chapters",
    highlights: "Highlights",
    topics: "Topics",
    faqs: "FAQs",
};

let cachedLogoDataUrl = null;

async function loadLogo() {
    if (cachedLogoDataUrl) return cachedLogoDataUrl;
    cachedLogoDataUrl = await urlToBase64(LOGO_PATH);
    return cachedLogoDataUrl;
}

function rgb(doc, [r, g, b]) {
    doc.setFillColor(r, g, b);
    doc.setDrawColor(r, g, b);
    doc.setTextColor(r, g, b);
}

function sanitizeFilename(name) {
    return (name || "source")
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80) || "source";
}

function formatRef(item) {
    if (item?.timestamp?.length >= 2) {
        return `${item.timestamp[0]} – ${item.timestamp[1]}`;
    }
    if (item?.start_time && item?.end_time) {
        return `${item.start_time} – ${item.end_time}`;
    }
    if (item?.page != null && item?.page !== "") {
        return `Page ${item.page}`;
    }
    return null;
}

class MetadataPdfDocument {
    constructor({ sourceTitle, metadataType, logoDataUrl }) {
        this.doc = new jsPDF({ unit: "mm", format: "a4" });
        this.sourceTitle = sourceTitle || "Untitled source";
        this.metadataLabel = METADATA_LABELS[metadataType] || metadataType;
        this.logoDataUrl = logoDataUrl;
        this.y = MARGIN;
        this.pageHasBody = false;
    }

    newPage() {
        this.doc.addPage();
        this.y = MARGIN;
        this.pageHasBody = false;
        this.drawRunningHeader();
    }

    ensureSpace(heightMm) {
        if (this.y + heightMm > FOOTER_Y - 4) {
            this.newPage();
        }
    }

    drawRunningHeader() {
        const { doc } = this;
        rgb(doc, COLORS.primary);
        doc.setFillColor(...COLORS.primary);
        doc.rect(0, 0, PAGE_W, 3.5, "F");

        rgb(doc, COLORS.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(this.metadataLabel, MARGIN, 10);
        doc.text(this.sourceTitle, PAGE_W - MARGIN, 10, { align: "right" });

        rgb(doc, COLORS.border);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, 12, PAGE_W - MARGIN, 12);
        this.y = 18;
    }

    drawCoverHeader() {
        const { doc } = this;

        rgb(doc, COLORS.primary);
        doc.setFillColor(...COLORS.primary);
        doc.rect(0, 0, PAGE_W, 28, "F");

        rgb(doc, COLORS.primaryMid);
        doc.setFillColor(...COLORS.primaryMid);
        doc.circle(PAGE_W - 22, -6, 38, "F");
        doc.setFillColor(139, 92, 246);
        doc.circle(PAGE_W - 55, 22, 18, "F");

        if (this.logoDataUrl) {
            try {
                doc.addImage(this.logoDataUrl, "PNG", MARGIN, 7, 42, 14);
            } catch {
                /* logo optional */
            }
        }

        rgb(doc, COLORS.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Metadata export", PAGE_W - MARGIN, 11, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const exportedAt = new Date().toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
        doc.text(exportedAt, PAGE_W - MARGIN, 16, { align: "right" });

        this.y = 36;

        rgb(doc, COLORS.primarySoft);
        doc.setFillColor(...COLORS.primarySoft);
        doc.roundedRect(MARGIN, this.y, CONTENT_W, 10, 2, 2, "F");
        rgb(doc, COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(this.metadataLabel.toUpperCase(), MARGIN + 4, this.y + 6.5);

        this.y += 14;

        rgb(doc, COLORS.ink);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const titleLines = doc.splitTextToSize(this.sourceTitle, CONTENT_W);
        doc.text(titleLines, MARGIN, this.y);
        this.y += titleLines.length * 6.5 + 2;

        rgb(doc, COLORS.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`Source document · ${this.metadataLabel}`, MARGIN, this.y);
        this.y += 8;

        rgb(doc, COLORS.border);
        doc.setLineWidth(0.35);
        doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
        this.y += 10;
        this.pageHasBody = true;
    }

    addBodyTitle(text) {
        this.ensureSpace(12);
        rgb(this.doc, COLORS.ink);
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(11);
        this.doc.text(text, MARGIN, this.y);
        this.y += 8;
    }

    addParagraph(text, { fontSize = 10, muted = false } = {}) {
        const plain = htmlToPlainText(String(text ?? ""));
        if (!plain) return;

        rgb(this.doc, muted ? COLORS.muted : COLORS.ink);
        this.doc.setFont("helvetica", muted ? "italic" : "normal");
        this.doc.setFontSize(fontSize);
        const lines = this.doc.splitTextToSize(plain, CONTENT_W);
        const blockHeight = lines.length * (fontSize * 0.45) + 4;
        this.ensureSpace(blockHeight);
        this.doc.text(lines, MARGIN, this.y);
        this.y += blockHeight + 2;
    }

    addCard({ badge, title, body, index }) {
        const plainBody = htmlToPlainText(String(body ?? ""));
        const titleText = title ? String(title) : "";
        rgb(this.doc, COLORS.ink);
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(10);
        const titleLines = titleText ? this.doc.splitTextToSize(titleText, CONTENT_W - 12) : [];

        rgb(this.doc, COLORS.muted);
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(9.5);
        const bodyLines = plainBody ? this.doc.splitTextToSize(plainBody, CONTENT_W - 12) : [];

        const cardH =
            8 +
            (badge ? 5 : 0) +
            titleLines.length * 5 +
            bodyLines.length * 4.5 +
            6;

        this.ensureSpace(cardH);

        rgb(this.doc, COLORS.surface);
        this.doc.setFillColor(...COLORS.surface);
        rgb(this.doc, COLORS.border);
        this.doc.setDrawColor(...COLORS.border);
        this.doc.setLineWidth(0.25);
        this.doc.roundedRect(MARGIN, this.y, CONTENT_W, cardH, 2.5, 2.5, "FD");

        rgb(this.doc, COLORS.primary);
        this.doc.setFillColor(...COLORS.primary);
        this.doc.rect(MARGIN, this.y, 2.2, cardH, "F");

        let innerY = this.y + 6;
        const innerX = MARGIN + 6;

        if (badge) {
            rgb(this.doc, COLORS.primary);
            this.doc.setFont("helvetica", "bold");
            this.doc.setFontSize(8);
            this.doc.text(badge, innerX, innerY);
            innerY += 5;
        }

        if (titleLines.length) {
            rgb(this.doc, COLORS.ink);
            this.doc.setFont("helvetica", "bold");
            this.doc.setFontSize(10);
            this.doc.text(titleLines, innerX, innerY);
            innerY += titleLines.length * 5 + 1;
        }

        if (bodyLines.length) {
            rgb(this.doc, COLORS.muted);
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(9.5);
            this.doc.text(bodyLines, innerX, innerY);
        }

        this.y += cardH + 5;
        this.pageHasBody = true;

        if (index != null && index % 3 === 2) {
            this.y += 2;
        }
    }

    addChipRow(labels) {
        const items = (labels || []).filter(Boolean);
        if (!items.length) return;

        this.ensureSpace(14);
        let x = MARGIN;
        const rowY = this.y + 5;

        items.forEach((label) => {
            rgb(this.doc, COLORS.primary);
            this.doc.setFont("helvetica", "bold");
            this.doc.setFontSize(8.5);
            const text = String(label);
            const w = this.doc.getTextWidth(text) + 8;

            if (x + w > PAGE_W - MARGIN) {
                this.y += 10;
                x = MARGIN;
                this.ensureSpace(10);
            }

            rgb(this.doc, COLORS.primarySoft);
            this.doc.setFillColor(...COLORS.primarySoft);
            this.doc.roundedRect(x, this.y, w, 7, 2, 2, "F");
            rgb(this.doc, COLORS.primary);
            this.doc.text(text, x + 4, this.y + 5);
            x += w + 3;
        });

        this.y += 12;
    }

    addFooters() {
        const total = this.doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            this.doc.setPage(i);
            rgb(this.doc, COLORS.border);
            this.doc.setLineWidth(0.2);
            this.doc.line(MARGIN, FOOTER_Y - 4, PAGE_W - MARGIN, FOOTER_Y - 4);

            rgb(this.doc, COLORS.muted);
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(8);
            this.doc.text("Generated with Crisp AI", MARGIN, FOOTER_Y);
            this.doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, FOOTER_Y, { align: "right" });
        }
    }

    save(filename) {
        this.addFooters();
        this.doc.save(filename);
    }
}

function buildTranscription(pdf, segments) {
    pdf.addBodyTitle("Full transcript");
    segments.forEach((seg, index) => {
        pdf.addCard({
            badge: formatRef(seg),
            title: null,
            body: seg.content,
            index,
        });
    });
}

function buildSummary(pdf, content) {
    pdf.addBodyTitle("Overview");
    pdf.addParagraph(content, { fontSize: 10.5 });
}

function buildChapters(pdf, chapters) {
    pdf.addBodyTitle("Chapter breakdown");
    chapters.forEach((ch, index) => {
        pdf.addCard({
            badge: formatRef(ch),
            title: ch.title,
            body: ch.content,
            index,
        });
    });
}

function buildHighlights(pdf, highlights) {
    pdf.addBodyTitle("Key highlights");
    highlights.forEach((item, index) => {
        pdf.addCard({
            badge: formatRef(item),
            title: item.title,
            body: item.content,
            index,
        });
    });
}

function buildTopics(pdf, keywords) {
    pdf.addBodyTitle("Topic tags");
    pdf.addChipRow(keywords.map((k) => k.keyword ?? k));
}

function buildFaqs(pdf, faqs) {
    pdf.addBodyTitle("Questions & answers");
    faqs.forEach((faq, index) => {
        pdf.addCard({
            badge: `Q${index + 1}`,
            title: faq.question,
            body: faq.answer,
            index,
        });
    });
}

const BUILDERS = {
    transcription: (pdf, payload) => buildTranscription(pdf, payload?.segments ?? []),
    summary: (pdf, payload) => buildSummary(pdf, payload?.content),
    chapters: (pdf, payload) => buildChapters(pdf, payload?.chapters ?? []),
    highlights: (pdf, payload) => buildHighlights(pdf, payload?.highlights ?? []),
    topics: (pdf, payload) => buildTopics(pdf, payload?.keywords ?? []),
    faqs: (pdf, payload) => buildFaqs(pdf, payload?.faqs ?? []),
};

/**
 * @param {{ metadataType: keyof BUILDERS, sourceTitle: string, payload: object }} options
 */
export async function exportMetadataToPdf({ metadataType, sourceTitle, payload }) {
    const builder = BUILDERS[metadataType];
    if (!builder) {
        throw new Error(`Unsupported metadata type: ${metadataType}`);
    }

    const logoDataUrl = await loadLogo();
    const pdf = new MetadataPdfDocument({ sourceTitle, metadataType, logoDataUrl });
    pdf.drawCoverHeader();
    builder(pdf, payload);

    const label = (METADATA_LABELS[metadataType] || metadataType).toLowerCase().replace(/\s+/g, "-");
    const filename = `${sanitizeFilename(sourceTitle)}-${label}.pdf`;
    pdf.save(filename);
}

export { METADATA_LABELS };
