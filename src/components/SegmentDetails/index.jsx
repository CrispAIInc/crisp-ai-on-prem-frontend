import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { SaveCheck, X, Download } from "lucide-react";
import { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { SettingsContext } from '../../contexts/settingsContext';
import useFirebase from '../../hooks/useFirebase';
import BaseHeading from '../BaseHeading';
import CustomVideoPlayer from '../CustomVideoPlayer';
import RippleButton from '../RippleButton';
import SaveSegmentModal from '../SaveSegmentModal';


export default function SegmentDetails() {

    const { generalSettings: { video_autoplay, video_loop } } = useContext(SettingsContext);

    const {
        currentSegment,
        setCurrentSegment,
        knowledgeBase,
        setSegmentDescriptions,
        resourceURL,
        setIsPlayerReady,
        setHasDuration,
        player
    } = useContext(MainContext);

    const { getPublicUrl } = useFirebase();

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(Boolean(currentSegment && currentSegment.id));
    const [sourcePublicUrl, setSourcePublicUrl] = useState(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    const { id, source_id, ...displayableSegmentJson } = currentSegment;

    // reset/update saved flag when currentSegment changes
    useEffect(() => {
        setIsSaved(Boolean(currentSegment && currentSegment.id));
    }, [currentSegment]);

    let source = { ...knowledgeBase.find(item => item.source_id === source_id), timestamp: displayableSegmentJson?.start || "00:00:00" } || {};

    useEffect(() => {
        getPublicUrl(source.video_url)
            .then(setSourcePublicUrl)
            .catch(console.error);
    }, [currentSegment, source.video_url, getPublicUrl]);


    // function base64ToUint8Array(base64) {
    //     const binaryString = window.atob(base64);
    //     const len = binaryString.length;
    //     const bytes = new Uint8Array(len);
    //     for (let i = 0; i < len; i++) {
    //         bytes[i] = binaryString.charCodeAt(i);
    //     }
    //     return bytes;
    // }

    // Helper: Generate inline chips with "Fake Padding" using borders
    // function createChipSection(title, tagsArray, bgColor, textColor, fontFamily) {
    //     const paragraphs = [
    //         new Paragraph({
    //             spacing: { before: 300, after: 150 },
    //             children: [
    //                 new TextRun({
    //                     text: title.toUpperCase(),
    //                     bold: true,
    //                     size: 18,
    //                     color: "64748B",
    //                     font: fontFamily,
    //                     characterSpacing: 1.5
    //                 })
    //             ]
    //         })
    //     ];

    //     if (!tagsArray || tagsArray.length === 0 || (tagsArray.length === 1 && !tagsArray[0])) {
    //         paragraphs.push(new Paragraph({
    //             children: [new TextRun({ text: "None detected", color: "A0AEC0", font: fontFamily, size: 20 })]
    //         }));
    //         return paragraphs;
    //     }

    //     const chipRuns = [];
    //     tagsArray.forEach((tag, index) => {
    //         const cleanTag = tag.trim();
    //         if (!cleanTag) return;

    //         chipRuns.push(
    //             new TextRun({
    //                 text: `\u00A0${cleanTag.toLowerCase()}\u00A0`,
    //                 shading: { type: ShadingType.CLEAR, fill: bgColor },
    //                 color: textColor,
    //                 font: fontFamily,
    //                 size: 20,
    //                 bold: true,
    //                 // The "Secret Sauce" for padding:
    //                 // Adding a border the same color as the background expands the chip area
    //                 border: {
    //                     color: bgColor,
    //                     space: 4, // This acts like CSS padding (in points)
    //                     value: BorderStyle.SINGLE,
    //                     size: 6,
    //                 },
    //             })
    //         );

    //         // Gap between chips (using non-breaking spaces for stability)
    //         if (index < tagsArray.length - 1) {
    //             chipRuns.push(new TextRun({ text: "\u00A0\u00A0\u00A0" }));
    //         }
    //     });

    //     paragraphs.push(new Paragraph({
    //         lineSpacing: { before: 150, line: 360 }, // More vertical room for the thicker chips
    //         spacing: { after: 200 },
    //         children: chipRuns
    //     }));

    //     return paragraphs;
    // }
    // async function exportSceneAnalysisToDocx(data) {
    //     try {
    //         /* ---------- LOAD LOGO ---------- */
    //         const logoBase64 = await urlToBase64("/new-crips-ai-logo-black-resize.png");
    //         const logoBuffer = base64ToUint8Array(logoBase64.split(",")[1]);

    //         // 1. Extract and map data from your new JSON structure
    //         const videoName = data.video || "Unknown Video";
    //         const startTime = data.start || "00:00:00";
    //         const endTime = data.end || "00:00:00";
    //         const query = data.query || "No query provided.";

    //         const schema = data.response_format?.schema || {};
    //         const actionDesc = schema.action_description || "No description available.";

    //         // 1. Handle Newline formatting in description
    //         const descriptionParagraphs = actionDesc.split('\n').filter(p => p.trim() !== "");

    //         // Process On-Screen Text into an array for chips
    //         const ocrText = schema.onscreen_text?.detected ? schema.onscreen_text?.text_content : "";
    //         const ocrArray = Array.isArray(ocrText) ? ocrText.map(item => item.trim()).filter(i => i !== "") : [];

    //         // 3. Define Theme Colors
    //         const primaryColor = "8E44AD"; // A nice Purple for a cinematic theme
    //         const secondaryColor = "595959"; // Dark Gray
    //         const colors = {
    //             primary: "4338CA",    // Deep Indigo
    //             accent: "8B5CF6",     // Vibrant Violet
    //             textMain: "1E293B",   // Slate 800 (Soft Black)
    //             textMuted: "64748B",  // Slate 500 (Gray)
    //             bgShade: "F8FAFC",    // Slate 50 (Very light cool gray for boxes)
    //             highlight: "0EA5E9",  // Sky Blue
    //             // Chip Colors mapped from your screenshot
    //             moodBg: "D6E4FF",     // Soft Blue background
    //             moodText: "2F6BFF",   // Vibrant Blue text
    //             shotBg: "E8D5FA",     // Soft Purple background
    //             shotText: "9B51E0",   // Vibrant Purple text
    //             ocrBg: "DCFCE7",
    //             ocrText: "166534",
    //         };
    //         const fontFamily = "Inter, Helvetica Neue, Arial";

    //         // 4. Build Document Elements
    //         const docChildren = [
    //             // --- LOGO SECTION ---
    //             new Paragraph({
    //                 alignment: AlignmentType.LEFT,
    //                 spacing: { after: 200 },
    //                 children: [
    //                     new ImageRun({
    //                         data: logoBuffer,
    //                         transformation: { width: 170, height: 55 },
    //                         type: "png",
    //                     }),
    //                 ],
    //             }),

    //             // --- DOCUMENT TITLE ---
    //             new Paragraph({
    //                 text: "Scene Analysis Report",
    //                 heading: HeadingLevel.TITLE,
    //                 alignment: AlignmentType.CENTER,
    //                 spacing: { after: 250 },
    //             }),

    //             // --- METADATA SUBTITLE ---
    //             new Paragraph({
    //                 alignment: AlignmentType.CENTER,
    //                 spacing: { after: 100 },
    //                 children: [
    //                     new TextRun({
    //                         text: `File: ${videoName}`,
    //                         color: secondaryColor,
    //                         italics: true,
    //                         bold: true,
    //                         size: 24, // 12pt
    //                     }),
    //                 ],
    //             }),
    //             new Paragraph({
    //                 alignment: AlignmentType.CENTER,
    //                 spacing: { after: 600 },
    //                 children: [
    //                     new TextRun({
    //                         text: `Segment: [${startTime} - ${endTime}]`,
    //                         color: secondaryColor,
    //                         italics: true,
    //                         bold: true,
    //                         size: 24, // 12pt
    //                     }),
    //                 ],
    //             }),

    //             // --- QUERY SECTION ---
    //             new Paragraph({
    //                 text: "Prompt",
    //                 heading: HeadingLevel.HEADING_1,
    //                 spacing: { before: 400, after: 200 },
    //                 border: {
    //                     bottom: { color: primaryColor, space: 1, value: BorderStyle.SINGLE, size: 12 },
    //                 },
    //             }),
    //             new Paragraph({
    //                 spacing: { before: 100, after: 400 },
    //                 shading: { type: ShadingType.CLEAR, fill: colors.bgShade },
    //                 border: {
    //                     left: { color: colors.primary, space: 10, value: BorderStyle.SINGLE, size: 18 },
    //                     top: { color: colors.bgShade, space: 10, value: BorderStyle.SINGLE, size: 18 },
    //                     bottom: { color: colors.bgShade, space: 10, value: BorderStyle.SINGLE, size: 18 },
    //                     right: { color: colors.bgShade, space: 10, value: BorderStyle.SINGLE, size: 18 },
    //                 },
    //                 children: [
    //                     new TextRun({ text: query, size: 24, italics: true, color: colors.textMain, font: fontFamily }),
    //                 ],
    //             }),

    //             // --- ACTION DESCRIPTION SECTION ---
    //             new Paragraph({
    //                 text: "Action Description",
    //                 heading: HeadingLevel.HEADING_1,
    //                 spacing: { before: 200, after: 200 },
    //                 border: {
    //                     bottom: { color: primaryColor, space: 1, value: BorderStyle.SINGLE, size: 12 },
    //                 },
    //             }),
    //             ...descriptionParagraphs.map(text =>
    //                 new Paragraph({
    //                     spacing: { after: 200 },
    //                     alignment: AlignmentType.JUSTIFIED,
    //                     children: [new TextRun({ text, size: 22, color: colors.textMain, font: fontFamily })],
    //                 })
    //             ),



    //             // --- CINEMATIC DETAILS SECTION ---
    //             new Paragraph({
    //                 text: "Cinematic Details",
    //                 heading: HeadingLevel.HEADING_1,
    //                 spacing: { before: 200, after: 200 },
    //                 border: {
    //                     bottom: { color: primaryColor, space: 1, value: BorderStyle.SINGLE, size: 12 },
    //                 },
    //             }),

    //             ...createChipSection("Mood", schema.mood, colors.moodBg, colors.moodText, fontFamily),
    //             ...createChipSection("Shot Type", schema.shot_type, colors.shotBg, colors.shotText, fontFamily),
    //             ...createChipSection("On-Screen Text", ocrArray, colors.ocrBg, colors.ocrText, fontFamily),
    //         ];

    //         /* ---------- CHARACTER DIALOGUE ---------- */

    //         if (schema?.talking_head && schema?.talking_head?.length > 0) {

    //             docChildren.push(

    //                 new Paragraph({
    //                     spacing: { before: 400, after: 200 },
    //                     border: {
    //                         bottom: {
    //                             color: "E2E8F0",
    //                             value: BorderStyle.SINGLE,
    //                             size: 6
    //                         }
    //                     },
    //                     children: [
    //                         new TextRun({
    //                             text: "CHARACTER DIALOGUE",
    //                             bold: true,
    //                             size: 22,
    //                             color: colors.primary,
    //                             font: fontFamily
    //                         })
    //                     ]
    //                 })

    //             );

    //             schema?.talking_head?.forEach(segment => {

    //                 const match = segment.text_content.match(/\[(.*?)\]\s*(.*)/);

    //                 const time = match ? match[1] : "";
    //                 const text = match ? match[2] : segment.text_content;

    //                 docChildren.push(

    //                     new Paragraph({
    //                         spacing: { before: 200, after: 50 },
    //                         children: [
    //                             new TextRun({
    //                                 text: segment.character_name,
    //                                 bold: true,
    //                                 size: 22,
    //                                 color: colors.accent,
    //                                 font: fontFamily
    //                             })
    //                         ]
    //                     }),

    //                     new Paragraph({
    //                         spacing: { after: 50 },
    //                         children: [
    //                             new TextRun({
    //                                 text: `[${time}]`,
    //                                 italics: true,
    //                                 size: 18,
    //                                 color: colors.textMuted,
    //                                 font: fontFamily
    //                             })
    //                         ]
    //                     }),

    //                     new Paragraph({
    //                         spacing: { after: 200 },
    //                         children: [
    //                             new TextRun({
    //                                 text: text,
    //                                 size: 22,
    //                                 color: colors.textMain,
    //                                 font: fontFamily
    //                             })
    //                         ]
    //                     })

    //                 );

    //             });
    //         }

    //         // 5. Initialize Document Configuration
    //         const doc = new Document({
    //             creator: "Crisp AI Scene Analysis Exporter",
    //             styles: {
    //                 paragraphStyles: [
    //                     {
    //                         id: "Title",
    //                         name: "Title",
    //                         basedOn: "Normal",
    //                         next: "Normal",
    //                         run: { color: primaryColor, size: 52, bold: true, font: "Helvetica Neue" },
    //                     },
    //                     {
    //                         id: "Heading1",
    //                         name: "Heading 1",
    //                         basedOn: "Normal",
    //                         next: "Normal",
    //                         run: { color: primaryColor, size: 30, bold: true, font: "Helvetica Neue" },
    //                     },
    //                 ],
    //             },
    //             sections: [{
    //                 properties: {
    //                     page: {
    //                         margin: {
    //                             top: 720,
    //                             right: 720,
    //                             bottom: 720,
    //                             left: 720
    //                         }
    //                     }
    //                 }, children: docChildren
    //             }],
    //         });

    //         // 6. Generate and Download
    //         const blob = await Packer.toBlob(doc);
    //         const safeFilename = videoName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    //         saveAs(blob, `scene_analysis_${safeFilename}.docx`);

    //         console.log("Scene Analysis document successfully generated!");

    //     } catch (error) {
    //         console.error("Error generating the Word document:", error);
    //     }
    // }

    // function exportSegmentAsJson(segment) {
    //     const { id, timestampText, refs, ...rest } = segment;
    //     const safeFileName = `segment-${(segment.video || 'segment').replace(/[^a-zA-Z0-9-_]/g, '_')}-${segment.start || '0'}-${segment.end || '0'}.json`;
    //     const jsonData = JSON.stringify(rest, null, 2);
    //     const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
    //     const url = URL.createObjectURL(blob);

    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = safeFileName;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     URL.revokeObjectURL(url);
    // }

    const handleDownload = () => {
        setIsDownloading(true);
        try {
            const jsonString = JSON.stringify(currentSegment, null, 2); // formatted
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${currentSegment.title}.json`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDownloading(false);
        }
    };

    function onClose() {
        setShowVideoPlayer(false);
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                    <BaseHeading text="Scene analysis" className="text-md" />
                    <div className="flex items-center gap-2">
                        {/* action buttons */}
                        <RippleButton
                            cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                            disabled={isDownloading}
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                            {isDownloading ? <span className="animate-customPulse">Downloading...</span> : 'Export JSON'}
                        </RippleButton>
                        <div className="flex items-center gap-2 relative">

                            <RippleButton
                                cssClasses="px-2 flex items-center gap-1 py-2 text-sm rounded"
                                onClick={() => setCurrentSegment(null)}
                            >
                                <X size={16} />
                                Close
                            </RippleButton>
                        </div>


                        <div>
                            {!isSaved && (
                                <RippleButton cssClasses="px-2 flex items-center gap-1 py-2 text-sm rounded" onClick={() => setIsSaveModalOpen(true)}>
                                    <SaveCheck size={16} />
                                    Save
                                </RippleButton>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* asset player */}
            {showVideoPlayer && <div className="relative">
                <CustomVideoPlayer
                    sourcePublicUrl={sourcePublicUrl}
                    resourceURL={resourceURL}
                    video_autoplay={video_autoplay}
                    video_loop={video_loop}
                    title={source?.source_path}
                    chapters={source?.metadata?.chapters?.content || []}
                    highlights={source?.metadata?.highlights?.content || []}
                    onReady={() => setIsPlayerReady(true)}
                    onDuration={() => setHasDuration(true)}
                    playerRef={player}
                    onClose={onClose}
                />
            </div>}

            <JsonView
                value={displayableSegmentJson}
                style={lightTheme}
                theme="rjv-default"
                displayDataTypes={false}
            />

            {isSaveModalOpen && (
                <SaveSegmentModal
                    show={isSaveModalOpen}
                    onHide={() => setIsSaveModalOpen(false)}
                    segment={currentSegment}
                    setSegmentDescriptions={setSegmentDescriptions}
                    onSaved={() => setIsSaved(true)}
                />
            )}
        </div>
    );
}