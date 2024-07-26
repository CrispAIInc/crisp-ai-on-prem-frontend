import { useContext, useRef, useState, useEffect } from "react";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import { Document, Page } from "react-pdf";
import CustomSelect from "../CustomSelect";
import LoadingSpinner from "../LoadingSpinner";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CustomSelectTwo from '../CustomSelectTwo';

const MetadataPanel = () => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        setResourceURL,
        player,
        languageOptions,
        setIsPlayerReady,
        setActiveView,
        jumpToPage,
        selectedNote,
        activeView,
        theme,
        selectedStory
    } = useContext(MainContext);
    const [translatedResource, setTranslatedResource] = useState(currentResource);
    const [isTranslationLoading, setIsTranslationLoading] = useState(false);
    const [numPages, setNumPages] = useState();
    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const [chosenLanguage, setChosenLanguage] = useState('en');
    const PdfContainer = useRef();

    let currentResourceType = currentResource.file_type;

    useEffect(() => {
        if (isPdfLoaded && jumpToPage.page > 0 && jumpToPage.page <= numPages) {
            setTimeout(() => {
                const targetRef = pageRefs.current[jumpToPage.page - 1];
                if (targetRef && targetRef.scrollIntoView) {
                    targetRef.scrollIntoView({ behavior: "smooth" });
                }
            }, 1500);
        }
    }, [jumpToPage, numPages, isPdfLoaded]);

    useEffect(() => {
        if (activeView === "resource") {
            setTranslatedResource(currentResource);
            if (currentResource) translateMetadata("en", currentResource);
        }
    }, [currentResource]);

    const closeVideo = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setIsPlayerReady(false);
        setActiveView(() => {
            if (selectedNote.note_id !== "") {
                return "note";
            }
            if (selectedStory.story_id !== "") {
                return "story";
            }
            return null;
        });
    };

    const closePDF = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setActiveView(() => {
            if (selectedNote.note_id !== "") {
                return "note";
            }
            if (selectedStory.story_id !== "") {
                return "story";
            }
            return null;
        });
    };

    const closeImage = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setActiveView(() => {
            if (selectedNote.note_id !== "") {
                return "note";
            }
            if (selectedStory.story_id !== "") {
                return "story";
            }
            return null;
        });
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsPdfLoaded(true);
    };

    const pageRefs = useRef({});

    async function translateMetadata(chosenLanguage, object) {
        setChosenLanguage(chosenLanguage);
        setIsTranslationLoading(true);
        // make sure response body is also like httpRequestBody (w/o lang)
        // the response body object must contain keys in English
        let httpRequestBody = {
            lang: chosenLanguage,
            summary: {
                title: "",
                content: "",
            },
            topic_summaries: {
                title: "",
                content: "",
            },
            transcript: {
                title: "",
                content: "",
            },
            caption: {
                title: "",
                content: "",
            },
            keywords: {
                title: "",
                content: "",
            },
        };
        const TRANSLATABLE_KEYS = [
            "summary",
            "topic_summaries",
            "transcript",
            "caption",
            "keywords",
        ];
        // extract keys/values from object (summary, topic_summaries, keywords, transcript and caption)
        for (const [key, value] of Object.entries(object)) {
            if (TRANSLATABLE_KEYS.includes(key) && (key !== 'transcript' || currentResourceType !== 'pdf')) {
                httpRequestBody[key].title =
                    key === "topic_summaries"
                        ? "Detailed summary"
                        : key.charAt(0).toUpperCase() + key.slice(1);
                httpRequestBody[key].content =
                    typeof value === "object" ? value.content : value;
            }
        }
        try {
            const httpResponseBody = await makeApiRequest(
                "/translate-metadata",
                "post",
                httpRequestBody
            );
            setTranslatedResource({ ...httpResponseBody, lang: chosenLanguage });
        } catch (error) {
            console.log(error);
        } finally {
            setIsTranslationLoading(false);
        }
    }

    return (
        <div className="max-w-4xl pt-10 mx-auto">
            {currentResource.file_type === "video" && (
                <div className="relative">
                    <CancelIcon
                        onClick={closeVideo}
                        color="error"
                        className="absolute z-50 cursor-pointer right-4 top-2"
                    />
                    <ReactPlayer
                        id="react-player"
                        width={"100%"}
                        height={"100%"}
                        playing={true}
                        url={resourceURL}
                        onReady={() => setIsPlayerReady(true)}
                        ref={player}
                        controls
                    />
                    {/* video summary */}
                    {!isTranslationLoading ? (
                        <div className={`mt-10 metadata-container ${(chosenLanguage === 'ar' || chosenLanguage === 'ku' || chosenLanguage === 'ckb' || chosenLanguage === 'iw' || chosenLanguage === "ur") && 'text-right'}`}>
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(lang) => translateMetadata(lang.value, translatedResource)}
                                placeholder="Select a language"
                            />
                            {currentResource.source_path === 'Sacred Valley _ PERU.mp4' ? (
                                <>
                                    <h3
                                        className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                            }`}
                                    >
                                        {translatedResource?.summary?.title}
                                    </h3>
                                    <p
                                        className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                            }`}
                                    >
                                        {translatedResource?.summary?.content}
                                    </p>

                                    <h3
                                        className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                            }`}
                                    >
                                        {translatedResource?.topic_summaries?.title}
                                    </h3>
                                    <p
                                        className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                            }`}
                                    >
                                        {translatedResource?.topic_summaries?.content}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                        }`}>Combined summary</h3>
                                    <p className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                        }`}>The video begins with a sweeping aerial shot of the majestic Andean mountains, the
                                        foreground grasses blurring as the camera glides over them. The rugged peaks rise in the
                                        middle ground, with higher, darker mountains and patches of snow visible in the
                                        background. Large, fluffy clouds drift across the sky, casting shadows on the terrain below,
                                        setting a serene and awe-inspiring tone for the journey ahead.<br /><br />

                                        The scene transitions to a close-up of an elderly person&apos;s face, their weathered skin and closed eyes reflecting a life of experience and connection to the land. They wear a colorful, woven headband with vibrant red, green, and white patterns, hinting at the cultural richness of the story about to unfold.<br /><br />

                                        We then see a wide-angle view of an individual standing on a rocky outcrop, overlooking an
                                        expansive landscape of patchwork fields and distant, snow-capped mountains. The
                                        person, dressed in traditional Andean attire, raises their arms in a gesture of offering or
                                        prayer, deeply connected to the natural beauty around them.<br /><br />

                                        As the sun rises or sets, casting a warm glow over the rugged hillside, the camera captures
                                        a person kneeling on a stone structure, their head bowed in reflection or prayer. The
                                        peaceful, reflective mood emphasizes their bond with the environment and the spiritual
                                        significance of the moment.<br /><br />

                                        The scene shifts to a vibrant cultural celebration, where three individuals in colorful
                                        traditional attire dance energetically. Their red dresses and intricate patterns create a
                                        dynamic visual, while the stone structure and grassy ground in the background suggest a
                                        setting rich in cultural heritage.<br /><br />

                                        Focusing on a single dancer, the video captures the intense expression and intricate
                                        costume, complete with a bright red headpiece and flowing tassels. The dancer&apos;s
                                        movements are graceful and powerful, symbolizing the deep cultural traditions of the
                                        Andean people.<br /><br />

                                        The narrative continues with a group of dancers in a picturesque village, their vibrant attire
                                        and rhythmic movements creating a lively, festive atmosphere. Stone buildings with
                                        thatched roofs and lush hills in the background enhance the sense of cultural celebration.<br /><br />

                                        On a rocky outcrop, another scene shows an individual blowing into a conch shell, possibly
                                        as part of a ritual. The vast landscape of fields and mountains under a clear sky provides a
                                        breathtaking backdrop, highlighting the reverence and connection to the natural world.<br /><br />

                                        A solitary bull stands in a field against a dramatic mountainous backdrop, creating a
                                        serene yet slightly melancholic atmosphere. The stillness of the bull contrasts with the
                                        grand, imposing mountains, emphasizing the timeless beauty of the Andean landscape.<br /><br />

                                        The camera zooms in on a person engaged in a ceremonial act, holding a small, curved
                                        object close to their mouth. Their eyes are closed in concentration, their colorful woven
                                        headband and traditional attire adding to the cultural significance of the moment.<br /><br />

                                        Next, we see an overhead shot of a narrow bridge spanning a turbulent river. A person in
                                        vibrant red attire and a dark animal cross the bridge, the fast-flowing water below adding a
                                        sense of motion and danger. This scene underscores the resilience and harmony of life in
                                        the Andes.<br /><br />

                                        As the journey progresses, a person in traditional clothing leads a dark animal across a
                                        narrow suspension bridge over a flowing river. The dramatic cliffs and warm light from the
                                        setting sun create a visually striking and culturally rich image of life in the mountains.<br /><br />

                                        The video then shows two people working in a rocky, mountainous area, emphasizing the
                                        ruggedness and resilience required for such labor. The clear sky and rocky terrain highlight
                                        the harsh yet beautiful environment they inhabit.<br /><br />

                                        A group of llamas grazes in a grassy field with dark, rugged mountains in the background.
                                        This tranquil scene captures the harmony between livestock and the natural environment
                                        in the Andes.<br /><br />

                                        A leisurely horse walks through a grassy field, with hills or mountains in the background,
                                        creating a serene rural landscape. The scene reflects the calm and peaceful pace of life in
                                        the Andean region.<br /><br />

                                        The narrative reaches a highlight with a breathtaking view of Machu Picchu, where a person
                                        in vibrant traditional clothing looks out over the iconic ruins. The clear sky and stunning
                                        scenery emphasize the historical and cultural significance of this sacred site.<br /><br />

                                        A pastoral scene follows, with a shepherd guiding a flock of sheep across an open
                                        landscape under a cloudy sky. The expansive view and the shepherd&apos;s traditional attire
                                        evoke a sense of timeless rural life.<br /><br />

                                        The video captures a smiling woman in traditional Andean clothing, standing in an open
                                        landscape with mountains in the background. Her joy and the beautiful scenery create an
                                        inviting and warm atmosphere.<br /><br />

                                        The journey continues through a rural landscape, where a woman in vibrant traditional
                                        clothing walks, carrying something in her arms. The mountainous area, trees, and distant
                                        village emphasize the deep connection between the people and their environment.<br /><br />

                                        We see a clay pot with green leaves on a stone hearth, with a fire burning beneath it. This
                                        outdoor cooking scene highlights traditional Andean culinary practices, capturing the
                                        simplicity and authenticity of their way of life.<br /><br />

                                        A close-up of hands squeezing yellowish fibers over a decorated ceramic bowl showcases
                                        traditional craft or cooking processes. The outdoor setting and natural elements
                                        emphasize the cultural heritage and artisanal skills of the Andean people.<br /><br />

                                        The camera captures hands tying a braided rope around a wooden post, with colorful
                                        sleeves indicating traditional attire. This scene highlights the rich cultural traditions and
                                        skilled craftsmanship in the Andes.<br /><br />

                                        An aerial view of a meandering river with people in vibrant clothing gathered near the bank
                                        creates a picturesque scene. The lush vegetation and surrounding landscape emphasize
                                        community and cultural activities in harmony with nature.<br /><br />

                                        A person in dark clothing walks down a narrow street in a traditional village, the rustic
                                        buildings and natural light creating a nostalgic atmosphere. The silhouette of mountains in
                                        the background adds to the scenic beauty.<br /><br />

                                        An aerial view of a village with red-tiled roofs against a backdrop of majestic mountains is
                                        shown. The early morning or late afternoon light casts shadows, enhancing the dramatic
                                        landscape. The scene highlights the serene and grand setting of the Andean village.<br /><br />

                                        The video captures a flock of sheep being herded through a village street, with rustic
                                        buildings and natural light suggesting a daily life scene rich in tradition and community.<br /><br />

                                        A quiet street scene in the early morning or late evening shows a woman in traditional
                                        clothing walking alone. The peaceful atmosphere and blend of modern and traditional
                                        structures reflect the timeless charm of the village.<br /><br />

                                        A woman in traditional clothing prepares food in a rustic kitchen with stone walls. The
                                        scene captures the essence of Andean culinary traditions, emphasizing the cultural and
                                        communal aspects of food preparation.<br /><br />

                                        The video depicts a woman holding up a large glass of frothy chicha in celebration. The
                                        warm, homely setting with traditional items hanging on the walls creates a festive and
                                        inviting atmosphere.<br /><br />

                                        A man in traditional clothing adjusts his shawl against a blurred mountainous landscape,
                                        highlighting the everyday life and cultural practices in the Andean region.<br /><br />

                                        The scene shifts to a woman pouring a thick, creamy liquid into a cup in a rustic kitchen.
                                        The traditional setting and food preparation methods create a warm, homely atmosphere
                                        rich in cultural heritage.<br /><br />

                                        The video then captures a group of people dancing in traditional costumes against a setting
                                        or rising sun. The colorful attire and clear sky create a dramatic, culturally rich scene,
                                        emphasizing the vibrant traditions of the Andes.<br /><br />

                                        A person in a traditional costume and mask performs a cultural dance, with the blurred
                                        mountainous background enhancing the cultural heritage and vibrant traditions.<br /><br />

                                        A close-up of a traditional ceramic figurine, likely a bull, highlights the craftsmanship and
                                        intricate details, showcasing the artistic heritage of the Andean people.<br /><br />

                                        The video shows a close-up of a live bull with decorated horns, emphasizing traditional
                                        farming practices and the bull&apos;s importance in the cultural landscape.<br /><br />

                                        Hands harvesting quinoa in traditional clothing highlight agricultural practices and cultural
                                        traditions, emphasizing the connection to the land.<br /><br />

                                        A close-up of a man in vibrant traditional attire during a cultural dance captures his
                                        focused expression and intricate costume, reflecting the significance of the activity.<br /><br />

                                        The video shows three people in traditional clothing holding large glasses of frothy chicha,
                                        celebrating in a festive atmosphere. The stone wall backdrop and colorful attire highlight
                                        the communal and cultural aspects of Andean life.<br /><br />

                                        A man stands in a rustic doorway holding a traditional ceramic figurine, with colorful
                                        patterns and a dimly lit room behind him. The scene emphasizes the cultural heritage and
                                        craftsmanship of the Andean people.<br /><br />

                                        The video concludes with individuals participating in a traditional ceremony on a hillside,
                                        with a view of a valley and mountains. The early morning or late afternoon light creates a
                                        warm glow, highlighting cultural rituals and the deep connection to the land.<br /><br />

                                        The final scene shows an individual standing on a rocky outcrop, arms outstretched, facing
                                        the vast landscape of rolling hills, fields, and snow-capped mountains. The warm light of
                                        sunrise or sunset casts a serene, reverent atmosphere, emphasizing the timeless
                                        connection between culture, tradition, and nature in the Andes.<br /><br />

                                        ---<br /><br />

                                        This video travelogue weaves together stunning visuals and cultural narratives, capturing
                                        the essence of Andean life and landscapes. Each scene offers a glimpse into the rich
                                        traditions, practices, and breathtaking beauty of the Andean region, creating a cohesive
                                        and engaging story for the viewer.</p>
                                </>
                            )}

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.transcript?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.transcript?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.keywords?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.keywords?.content}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mt-10">
                            <LoadingSpinner isSmall={true} />
                            <span
                                className={`font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                Loading translated metadata...
                            </span>
                        </div>
                    )}
                </div>
            )}
            {currentResource.file_type === "pdf" && (
                <>
                    <div
                        className="relative h-[60vh] w-full mx-auto overflow-x-hidden overflow-y-auto"
                        ref={PdfContainer}
                    >
                        <CancelIcon
                            onClick={closePDF}
                            className="absolute right-1 top-[15px] cursor-pointer z-50"
                        />
                        <Document
                            className="!w-full mx-auto"
                            file={resourceURL}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    ref={(el) => {
                                        pageRefs.current[index] = el;
                                    }}
                                >
                                    <Page
                                        _className="mx-auto !w-full !min-w-0"
                                        className="!w-full mx-auto"
                                        pageNumber={index + 1}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                    {/* PDF summary */}
                    {!isTranslationLoading ? (
                        <div className={`mt-10 metadata-container ${(chosenLanguage === 'ar' || chosenLanguage === 'ku' || chosenLanguage === 'ckb' || chosenLanguage === 'iw' || chosenLanguage === "ur") && 'text-right'}`}>
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(lang) => translateMetadata(lang.value, translatedResource)}
                                placeholder="Select a language"
                            />
                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.summary?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.summary?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.topic_summaries?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.topic_summaries?.content}
                            </p>

                            {/* <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.transcript?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.transcript?.content}
                            </p> */}

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.keywords?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.keywords?.content}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mt-10">
                            <LoadingSpinner isSmall={true} />
                            <span
                                className={`font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                Loading translated metadata...
                            </span>
                        </div>
                    )}
                </>
            )}
            {currentResource.file_type === "img" && (
                <div>
                    <div className="relative w-[70%] h-72 w-full h-full max-w-lg mx-auto">
                        <CancelIcon
                            onClick={closeImage}
                            className="absolute right-[1%] top-[15px] cursor-pointer"
                        />
                        <img
                            className="w-full h-full pt-2 rounded-lg source-img"
                            src={resourceURL}
                        />
                    </div>
                    {/* Image Caption */}
                    {!isTranslationLoading ? (
                        <div className={`mt-10 metadata-container ${(chosenLanguage === 'ar' || chosenLanguage === 'ku' || chosenLanguage === 'ckb' || chosenLanguage === 'iw' || chosenLanguage === "ur") && 'text-right'}`}>
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(lang) => translateMetadata(lang.value, translatedResource)}
                                placeholder="Select a language"
                            />
                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.caption?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.caption?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.keywords?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.keywords?.content}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mt-10">
                            <LoadingSpinner isSmall={true} />
                            <span
                                className={`font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                Loading translated metadata...
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default MetadataPanel;
