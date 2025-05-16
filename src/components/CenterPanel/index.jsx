import { useContext, useRef, useState, useEffect } from "react";
import CopilotSection from "../CopilotSection";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api/index.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import TextSkeleton from '../Skeletons/Base/TextSkeleton.jsx';

const MetadataPanel = ({ workspaceContainer }) => {
    const {
        currentResource,
        chatLoaded, setChatLoaded,
        displayedSources,
        activeView,
        theme,
    } = useContext(MainContext);

    const { sidebarWidth } = useResizableSidebar(200, false);
    const metadataPanelContainer = useRef(null);

    const [combinedSummary, setCombinedSummary] = useState("");
    const [isCombinedSummaryPending, setIsCombinedSummaryPending] = useState(false);

    useEffect(() => {
        console.log("qsdfjlsdfjkl kljdkqf kl");
        async function getCombinedSum() {
            try {
                setIsCombinedSummaryPending(true);
                const summary = await makeApiRequest('/combine-summaries', "POST", JSON.stringify({
                    sources: displayedSources?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                }));
                setCombinedSummary(summary?.combined_summary || "");
            } catch (e) {
                console.log(e);
            } finally {
                setIsCombinedSummaryPending(false);
            }
        }

        if (displayedSources?.length > 1 && activeView === "resource") {
            getCombinedSum();
        } else {
            setCombinedSummary(currentResource?.metadata?.summary?.content);
        }
    }, [displayedSources?.length, activeView]);

    return (
        <div className="relative flex flex-col max-w-4xl pt-10 mx-auto overflow-y-auto" ref={metadataPanelContainer}>
            <p>centerpanel</p>
            {activeView === 'resource' && <div>
                <div className={`mb-4 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}>
                    <h2 className="text-3xl font-semibold break-words">
                        {/* {currentResource?.source_path.replace(/\.[^/.]+$/, '')} */}
                        Sources Summary
                    </h2>
                    <span>{displayedSources?.length} Source{displayedSources?.length > 1 ? "s" : ""}</span>
                </div>
                {!isCombinedSummaryPending ? <p
                    className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}
                    dangerouslySetInnerHTML={{ __html: `<p>${combinedSummary !== undefined ? combinedSummary?.replace(/\n/gi, '<br />') : currentResource?.metadata?.summary?.content}</p>` }}
                ></p> : (
                    <div className="animate-pulse">
                        {new Array(10).fill(null).map((_, index) => (
                            <TextSkeleton key={index} className='h-3 mb-2' />
                        ))}
                    </div>
                )}
            </div>}

            <div className={`flex-1 mt-10 overflow-y-auto`}>
                <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} sidebarWidth={sidebarWidth} key={0} name="genInsights" />
            </div>
        </div >
    );
};
export default MetadataPanel;
