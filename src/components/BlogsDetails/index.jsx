import { CalendarDays, Download, FileText } from "lucide-react";
import { renderAsync } from "docx-preview";
import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../contexts/mainContext";
import { useToast } from "../../contexts/toastContext";
// import useFirebase from "../../hooks/useFirebase";
import { formatReadableDate } from "../../utils";

export default function BlogsDetails() {
    const { selectedBlog } = useContext(MainContext);
    // const { getPublicUrl } = useFirebase();
    const { notify } = useToast();
    const viewerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [renderAttempt, setRenderAttempt] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        async function renderBlog() {
            setIsLoading(true);
            setLoadError("");

            try {
                if (!selectedBlog?.blog_url) {
                    throw new Error("The generated blog document is unavailable.");
                }

                // const publicUrl = await getPublicUrl(selectedBlog.blog_url);
                if (!selectedBlog.blog_url) {
                    throw new Error("Could not retrieve the blog document.");
                }

                const response = await fetch(selectedBlog.blog_url);
                if (!response.ok) {
                    throw new Error(`Could not load the blog document (${response.status}).`);
                }
                const blob = await response.blob();

                if (isCurrent && viewerRef.current) {
                    viewerRef.current.innerHTML = "";
                    await renderAsync(blob, viewerRef.current);
                }
            } catch (error) {
                if (isCurrent) setLoadError(error.message || "Failed to load the blog document.");
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        renderBlog();
        return () => {
            isCurrent = false;
        };
    }, [selectedBlog?.blog_url, renderAttempt]);

    async function handleDownload() {
        setIsDownloading(true);
        try {
            // const publicUrl = await getPublicUrl(selectedBlog.blog_url);
            if (!selectedBlog.blog_url) {
                throw new Error("Could not retrieve the blog document.");
            }

            const response = await fetch(selectedBlog.blog_url);
            if (!response.ok) {
                throw new Error(`Could not download the blog document (${response.status}).`);
            }

            const blobUrl = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${selectedBlog.title || "blog"}.docx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            notify({
                variant: "error",
                heading: "Couldn't download blog",
                subheading: error.message || "An error occurred while downloading the blog.",
            });
        } finally {
            setIsDownloading(false);
        }
    }

    if (!selectedBlog) return null;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <FileText size={18} className="shrink-0 text-primary-300" />
                    <div className="min-w-0">
                        <h2 className="truncate text-[14px] font-semibold text-ink">{selectedBlog.title}</h2>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
                            <CalendarDays size={12} />
                            {selectedBlog.created_at
                                ? formatReadableDate(new Date(selectedBlog.created_at))
                                : "Generated blog"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading || !selectedBlog.blog_url}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-primary-300 hover:text-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={14} />
                    {isDownloading ? "Downloading..." : "Download"}
                </button>
            </header>

            <div className="min-h-0 flex-1 overflow-auto bg-surface-alt p-4">
                <div
                    ref={viewerRef}
                    className="min-h-full rounded-lg bg-white p-4 shadow-sm [&_.docx-wrapper]:!bg-white [&_.docx-wrapper>section]:!m-0 [&_.docx-wrapper>section]:!max-w-full [&_.docx-wrapper>section]:!rounded-lg [&_.docx-wrapper>section]:!shadow-none [&_.docx-wrapper>section]:!p-8"
                />
                {(isLoading || loadError) && (
                    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
                        {loadError ? (
                            <>
                                <p className="text-sm text-red-600">{loadError}</p>
                                <button
                                    type="button"
                                    onClick={() => setRenderAttempt((attempt) => attempt + 1)}
                                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-primary-300"
                                >
                                    Retry
                                </button>
                            </>
                        ) : (
                            <p className="animate-customPulse text-sm text-ink-muted">Loading blog...</p>
                        )}
                    </div>
                )}
            </div>

            <footer className="shrink-0 border-t border-border px-4 py-2.5">
                <p className="truncate text-[11px] text-ink-muted">
                    Source: {selectedBlog.source_path || selectedBlog.filename || "Unknown"}
                    {" | "}
                    {selectedBlog.is_full_source
                        ? "Full source"
                        : `Range: ${selectedBlog.range_from || "-"} - ${selectedBlog.range_to || "-"}`}
                </p>
            </footer>
        </div>
    );
}
