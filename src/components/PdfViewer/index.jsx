import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle, useContext } from "react";
import { Document, Page } from "react-pdf";
import {
    FileText,
    ChevronUp,
    ChevronDown,
    Minus,
    Plus,
    Download,
    Maximize2,
} from "lucide-react";
import { MainContext } from '../../contexts/mainContext';


const PdfViewer = forwardRef(function PdfViewer(
    { sourcePublicUrl, resourceURL, fileName = "Document.pdf", jumpToPage = null },
    ref
) {

    const { theme } = useContext(MainContext);

    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [scale, setScale] = useState(1.1);
    const [containerWidth, setContainerWidth] = useState(0);
    const [flashPage, setFlashPage] = useState(null);

    const pageRefs = useRef([]);
    const thumbRefs = useRef([]);
    const scrollRef = useRef(null);
    const isProgrammaticScroll = useRef(false);
    const pendingPage = useRef(null);

    // measure container to keep pages responsive
    useEffect(() => {
        if (!scrollRef.current) return;
        const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
        ro.observe(scrollRef.current);
        return () => ro.disconnect();
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        pageRefs.current = new Array(numPages).fill(null);
        thumbRefs.current = new Array(numPages).fill(null);
    };

    // keep the toolbar's page number in sync with scroll position
    const handleScroll = useCallback(() => {
        if (isProgrammaticScroll.current || !scrollRef.current) return;
        const containerTop = scrollRef.current.getBoundingClientRect().top;
        let closest = 1;
        let closestDist = Infinity;
        pageRefs.current.forEach((el, i) => {
            if (!el) return;
            const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i + 1;
            }
        });
        setCurrentPage(closest);
        setPageInput(String(closest));
    }, []);

    // Jumps to a page. If the document (or that page's ref) isn't ready yet —
    // e.g. someone clicks a citation before the PDF has finished loading —
    // this retries for up to ~4s instead of relying on a guessed timeout.
    const goToPage = useCallback(
        (page, { attempt = 0 } = {}) => {
            console.log("going to pae...");
            const target = Math.max(1, parseInt(page, 10) || 1);
            pendingPage.current = target;

            const clamped = numPages ? Math.min(target, numPages) : target;
            const el = pageRefs.current[clamped - 1];

            if (el && numPages) {
                pendingPage.current = null;
                isProgrammaticScroll.current = true;
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                setCurrentPage(clamped);
                setPageInput(String(clamped));
                setFlashPage(clamped);
                setTimeout(() => (isProgrammaticScroll.current = false), 500);
                setTimeout(() => setFlashPage((p) => (p === clamped ? null : p)), 1200);
                return true;
            }

            // not mounted yet (document still loading / numPages not set) — retry
            if (attempt < 40) {
                setTimeout(() => goToPage(target, { attempt: attempt + 1 }), 100);
            }
            return false;
        },
        [numPages]
    );

    // expose to parent components via ref: pdfViewerRef.current.goToPage(n)
    useImperativeHandle(ref, () => ({
        goToPage,
        getCurrentPage: () => currentPage,
        getNumPages: () => numPages,
    }));

    // controlled-prop path: external state like { page, nonce } triggers a jump
    useEffect(() => {
        if (jumpToPage?.page) goToPage(jumpToPage.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jumpToPage]);

    // if the doc finishes loading *after* an external jump request came in
    // (e.g. someone clicked a citation while the file was still downloading),
    // resume that pending jump once pages actually exist.
    useEffect(() => {
        if (numPages && pendingPage.current) {
            goToPage(pendingPage.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numPages]);

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        goToPage(parseInt(pageInput, 10) || 1);
    };

    const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)));
    const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)));

    const handleDownload = () => {
        const url = sourcePublicUrl || resourceURL;
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
    };

    const handleFullscreen = () => {
        scrollRef.current?.parentElement?.requestFullscreen?.();
    };

    // keyboard shortcuts: arrow keys navigate, +/- zoom
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.target.tagName === "INPUT") return;
            if (e.key === "ArrowDown" || e.key === "PageDown") goToPage(currentPage + 1);
            if (e.key === "ArrowUp" || e.key === "PageUp") goToPage(currentPage - 1);
            if (e.key === "+" || e.key === "=") zoomIn();
            if (e.key === "-") zoomOut();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [currentPage, numPages]);

    const pageWidth = containerWidth ? Math.min(containerWidth - 48, 760) * scale : undefined;

    return (
        <div
            className={`pdf-shell ${theme === "dark" ? "pdf-shell--dark" : "pdf-shell--light"}`}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "90%",
                height: 560,
                margin: "0 auto",
                borderRadius: 10,
                border: "1px solid var(--pdf-border)",
                overflow: "hidden",
                background: "var(--pdf-surface-1)",
                position: "relative"
            }}
        >
            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "8px 14px",
                    background: "var(--pdf-surface-2)",
                    borderBottom: "1px solid var(--pdf-border)",
                    flexShrink: 0,
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    width: '100%',
                    // height: "100%",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                    <FileText size={17} style={{ color: "var(--pdf-text-secondary)", flexShrink: 0 }} />
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--pdf-text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        title={fileName}
                    >
                        {fileName}
                    </span>
                </div>

                {/* Page jump */}
                <div style={pillStyle}>
                    <button style={iconBtnStyle} onClick={() => goToPage(currentPage - 1)} aria-label="Previous page">
                        <ChevronUp size={15} />
                    </button>
                    <form onSubmit={handlePageInputSubmit} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onBlur={handlePageInputSubmit}
                            style={pageInputStyle}
                            aria-label="Current page"
                        />
                        <span style={{ fontSize: 12, color: "var(--pdf-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                            / {numPages || "—"}
                        </span>
                    </form>
                    <button style={iconBtnStyle} onClick={() => goToPage(currentPage + 1)} aria-label="Next page">
                        <ChevronDown size={15} />
                    </button>
                </div>

                {/* Zoom */}
                <div style={pillStyle}>
                    <button style={iconBtnStyle} onClick={zoomOut} aria-label="Zoom out">
                        <Minus size={14} />
                    </button>
                    <span style={{ fontSize: 12, color: "var(--pdf-text-secondary)", minWidth: 36, textAlign: "center" }}>
                        {Math.round(scale * 100)}%
                    </span>
                    <button style={iconBtnStyle} onClick={zoomIn} aria-label="Zoom in">
                        <Plus size={14} />
                    </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 2 }}>
                    <button style={actionBtnStyle} onClick={handleDownload} aria-label="Download">
                        <Download size={16} />
                    </button>
                    <button style={actionBtnStyle} onClick={handleFullscreen} aria-label="Fullscreen">
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Body: thumbnails + page canvas */}
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Thumbnail rail */}
                {/* <div
                    style={{
                        width: 88,
                        flexShrink: 0,
                        overflowY: "auto",
                        padding: "10px 8px",
                        borderRight: "1px solid var(--pdf-border)",
                        background: "var(--pdf-surface-1)",
                    }}
                >
                    <Document file={sourcePublicUrl || resourceURL}>
                        {Array.from(new Array(numPages), (_, i) => (
                            <div
                                key={`thumb_${i + 1}`}
                                onClick={() => goToPage(i + 1)}
                                style={{
                                    cursor: "pointer",
                                    marginBottom: 8,
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    border: `${currentPage === i + 1 ? 2 : 1}px solid ${currentPage === i + 1 ? "var(--pdf-accent)" : "var(--pdf-border)"
                                        }`,
                                }}
                            >
                                <Page pageNumber={i + 1} width={70} renderTextLayer={false} renderAnnotationLayer={false} />
                            </div>
                        ))}
                    </Document>
                </div> */}

                {/* Page canvas */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "auto",
                        padding: "24px 0",
                        background: "var(--pdf-canvas-bg)",
                    }}
                >
                    <Document
                        file={sourcePublicUrl || resourceURL}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<LoadingSkeleton />}
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <div
                                key={`page_${index + 1}`}
                                ref={(el) => (pageRefs.current[index] = el)}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginBottom: 20,
                                }}
                            >
                                <div
                                    style={{
                                        boxShadow:
                                            flashPage === index + 1
                                                ? "0 0 0 3px var(--pdf-accent), 0 1px 3px rgba(0,0,0,0.12)"
                                                : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
                                        background: "#fff",
                                        transition: "box-shadow 0.25s ease",
                                    }}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        width={pageWidth}
                                        renderTextLayer
                                        renderAnnotationLayer
                                    />
                                </div>
                            </div>
                        ))}
                    </Document>
                </div>
            </div>

            {/* Status bar */}
            {/* <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "5px 0",
                    fontSize: 11,
                    color: "var(--pdf-text-muted)",
                    borderTop: "1px solid var(--pdf-border)",
                    background: "var(--pdf-surface-2)",
                    flexShrink: 0,
                }}
            >
                page {currentPage} of {numPages || "—"}
            </div> */}
        </div>
    );
});

export default PdfViewer;

function LoadingSkeleton() {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <div style={{ width: 400, height: 520, background: "var(--pdf-surface-2)", borderRadius: 4 }} />
        </div>
    );
}

const pillStyle = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "var(--pdf-surface-1)",
    border: "1px solid var(--pdf-border)",
    borderRadius: 6,
    padding: 3,
};

const iconBtnStyle = {
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: 4,
    color: "var(--pdf-text-secondary)",
    cursor: "pointer",
};

const actionBtnStyle = {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: 6,
    color: "var(--pdf-text-secondary)",
    cursor: "pointer",
};

const pageInputStyle = {
    width: 30,
    height: 24,
    textAlign: "center",
    border: "1px solid var(--pdf-border)",
    borderRadius: 4,
    fontSize: 12,
    background: "var(--pdf-surface-1)",
    color: "var(--pdf-text-primary)",
};
