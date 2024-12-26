
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useContext, useEffect, useState } from "react";

import makeApiRequest from "../../api";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SourceExplorer from "../SourceExplorer";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import FileFormatsModal from "../FileFormatsModal";
import CategoriesModal from "../CategoriesModal";
import ContentPanelThumbnail from "../ContentPanelThumbnail";
import { MainContext } from "../../contexts/mainContext";
import LoadingSpinner from "../LoadingSpinner";
import BaseHeading from '../BaseHeading';
import NoData from '../NoData';
import CustomButton from '../CustomButton';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import UploadIcon from '@mui/icons-material/Upload';
import SearchSection from '../SearchSection';
import { timeToSeconds } from '../../utils';
import ButtonDropdown from '../ButtonDropdown';
import {
    Home,
    ArrowForward,
    Edit,
    Upload,
    Settings,
    Folder,
    Search,
} from "@mui/icons-material";

const ContentSection = ({
    onThumbnailClick,
    handleCheckboxChange,
    knowledgeBase,
    setKnowledgeBase,
}) => {



    // Example menu data
    const menuData = [
        { label: "Home", icon: Home },
        {
            label: "Ingestion",
            icon: ArrowForward,
            children: [
                { label: "Index", icon: Folder },
                { label: "Upload", icon: Upload },
            ],
        },
        {
            label: "MRag",
            icon: Folder,
            children: [
                { label: "Sources", icon: Folder },
                { label: "Discovery", icon: Search },
            ],
        },
        { label: "Settings", icon: Settings },
    ];
    const {
        isPlayerReady,
        resourceURL,
        currentResource,
        setCurrentResource,
        player,
        selectedCategory,
        setChatLoaded,
        selectedSources,
        setSelectedSources,
        selectedAll,
        setSelectedAll,
        theme,
        chatLoaded
    } = useContext(MainContext);

    const categoryOptions = [
        { value: "all", label: "All" },
        { value: "generic", label: "Generic" },
        { value: "investment", label: "Investment" },
        { value: "human resources", label: "Human Resources" },
        { value: "customer interaction", label: "Customer Interaction" },
        { value: "documentaries", label: "Documentaries" },
        { value: "entertainment", label: "Entertainment" },
        { value: "insurance", label: "Insurance" },
        { value: "technical content", label: "Technical Content" },
    ];

    const categoryValues = categoryOptions.map((option) => option.value);

    const formatOptions = [
        { value: "all", label: "All" },
        { value: "video", label: "Videos" },
        { value: "pdf", label: "PDFs" },
        { value: "img", label: "Images" },
    ];

    const [isSearching, setIsSearching] = useState(false);

    const [showSourceExplorer, setShowSourceExplorer] = useState(false);
    const [showFileFormatsModal, setShowFileFormatsModal] = useState(false);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // True when a resource is being deleted
    const [clickedIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    // Flag indicating weather source Explorer modal was opened by clicking the "Source Explorer" button
    // or not
    const [isOpenedFromSourceExplorerBtn, setIsOpenedFromSourceExplorerBtn] =
        useState();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                const data = await makeApiRequest(
                    "/content",
                    "post",
                    JSON.stringify(categoryValues)
                );
                setKnowledgeBase(data);
            } catch (error) {
                console.warn(error);
            }
        };

        makeRequest();
    }, []);

    useEffect(() => {
        if (isPlayerReady && resourceURL && currentResource.file_type === "video") {
            const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
            if (timestamp && Number.isInteger(+timestamp))
                player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            else;
        }
    }, [isPlayerReady, currentResource, currentResource?.timestamp]);

    useEffect(() => {
        // Check if every item in knowledgeBase is selected
        const allSelected = knowledgeBase.every((item) => item.is_selected);

        // Update selectedAll state based on the check
        setSelectedAll(allSelected);
    }, [knowledgeBase]);

    const deleteResource = async (event, item) => {
        try {
            setIsDeleting(true);
            const requestBody = {
                category: item.category,
                fileName: item.source_path,
                fileType: item.file_type,
            };

            await makeApiRequest(`/delete`, "post", requestBody);
            setIsDeleting(false);

            setChatLoaded(false);
            const { chat_is_initialized } = await makeApiRequest(
                `/chat/${selectedCategory}`,
                "post",
                JSON.stringify({
                    sources: selectedSources,
                    category: selectedCategory,
                    selectedAll,
                    reinitialize: true,
                })
            );
            setChatLoaded(chat_is_initialized);

            const data = await makeApiRequest(
                `/content`,
                "post",
                JSON.stringify(categoryValues)
            );
            setKnowledgeBase(data);
            setCurrentResource(null);
        } catch (error) {
            setIsDeleting(false);
            console.log(error);
        }
    };
    const handleUpload = async (event, fileFormat) => {
        try {
            setIsUploading(true);
            const files = Array.from(event.target.files);
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("file", file);
                formData.append("category", selectedCategory);
                formData.append("fileType", fileFormat);
            });

            await makeApiRequest(`/upload`, "post", formData, { 'Content-type': "multipart/form-data" });
            const data = await makeApiRequest(
                `/content`,
                "post",
                JSON.stringify(categoryValues)
            );
            setKnowledgeBase(data);
            setIsUploading(false);
        } catch (error) {
            console.log(error);
            setIsUploading(false);
        }
    };

    const commitSelectedSources = () => {
        knowledgeBase.map((item) => {
            if (item.is_selected) {
                setSelectedSources((prev) => {
                    const itemExist = prev.find(i => i.source_path === item.source_path);
                    if (!itemExist) {
                        return [
                            ...prev,
                            {
                                source_path: item.source_path,
                                category: item.category,
                                file_type: item.file_type,
                            },
                        ];
                    }
                    return prev;
                });
            } else {
                setSelectedSources((prev) =>
                    prev.filter((source) => source !== item.source_path)
                );
            }
            return item;
        });
    };
    const handleExploreSources = () => {
        setShowSourceExplorer(true);
        setIsOpenedFromSourceExplorerBtn(true);
    };
    const onHideSourceExplorer = () => {
        setShowSourceExplorer(false);
    };
    /**
     * Function to open a modal showing all categories
     */
    const handleAddNewResource = () => {
        setShowCategoriesModal(true);
    };

    const handleSelectAllCheckboxChange = (path) => {
        const pathSegments = path.split("/").filter(Boolean); // Removes empty strings from array
        const category = pathSegments[0];
        const format = pathSegments[1];

        console.log(category, format);

        if (category === undefined) {
            const newSelectedValue = !selectedAll;
            setSelectedAll(newSelectedValue);
            knowledgeBase.forEach((item) => {
                item.is_selected = newSelectedValue;
            });
        }
        else {
            const updatedKnowledgeBase = knowledgeBase.map((item) => {
                // console.log(item.category.includes(category));
                // console.log(item.file_type === format || format === 'all');
                if (item.category.includes(category) && format === undefined) {
                    item.is_selected = !item.is_selected;
                    // setSelectedSources((prev) => {
                    //     const itemExist = prev.find(i => i.source_path === item.source_path);
                    //     if (!itemExist) {
                    //         return [
                    //             ...prev,
                    //             {
                    //                 source_path: item.source_path,
                    //                 category: item.category,
                    //                 file_type: item.file_type,
                    //             },
                    //         ];
                    //     }
                    //     return prev;
                    // });
                }
                else if (item.category.includes(category) && (item.file_type === format || format === 'all')) {
                    // console.log('heree');
                    item.is_selected = !item.is_selected;
                    // setSelectedSources((prev) => {
                    //     const itemExist = prev.find(i => i.source_path === item.source_path);
                    //     if (!itemExist) {
                    //         return [
                    //             ...prev,
                    //             {
                    //                 source_path: item.source_path,
                    //                 category: item.category,
                    //                 file_type: item.file_type,
                    //             },
                    //         ];
                    //     }
                    //     return prev;
                    // });
                }
                // if (item.is_selected) setSelectedAll(false);
                return item;
            });
            setKnowledgeBase(updatedKnowledgeBase);
        }
    };

    /**
     * Function to indicate wether a source thumbnail can be rendered in the selected sources section or not
     */
    const canRenderSourceThumbnail = (source) => {
        return source.is_selected;
    };

    const handleUnselectAllCheckboxChange = () => {
        const updatedKnowledgeBase = knowledgeBase.map((item) => {
            return { ...item, is_selected: false };
        });
        setKnowledgeBase(updatedKnowledgeBase);
        setSelectedSources([]);
    };

    return (
        <>
            <section className='relative flex flex-col items-start h-full'>

                <div className="w-full max-w-4xl pr-3">
                    {/* home */}
                    <div
                        className={`source-explorer ml-2 flex mb-1 items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                    >
                        <HomeIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Home</span>
                    </div>
                    {/* Ingestion */}
                    <div className="flex flex-col justify-start gap-2 mb-1">
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ingestion</span>
                        <div className="flex flex-col gap-0 ml-2">
                            {/* <div
                                className={`source-explorer  flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={handleExploreSources}
                            >
                                <FolderOpenIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Indexer</span>
                            </div> */}
                            <ButtonDropdown openSourceExplorer={handleExploreSources} />
                            <div
                                className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={handleAddNewResource}
                            >
                                <UploadIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Upload</span>
                            </div>
                        </div>
                    </div>
                    {/* mrag */}
                    <div className="flex flex-col justify-start gap-2 mb-2">
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>MRAG</span>
                        <div className="flex flex-col ml-2">
                            <div
                                className={`source-explorer flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={handleExploreSources}
                            >
                                <FolderOpenIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Sources</span>
                            </div>
                            <div className="global-search">
                                <div
                                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                    onClick={() => setIsSearching(!isSearching)}
                                >
                                    <SearchOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => setIsSearching(false)}>Discovery</span>
                                </div>
                                {
                                    isSearching && (
                                        <div className="flex items-center gap-2">
                                            {/* <span className={`cursor-pointer text-2xl ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => setIsSearching(false)}>&times;</span> */}
                                            <SearchSection chatLoaded={chatLoaded} className='flex-1' />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    {/* Settings */}
                    <div
                        className={`source-explorer ml-2 flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                    >
                        <SettingsIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Settings</span>
                    </div>
                </div>

                {showSourceExplorer && (
                    <SourceExplorer
                        show={showSourceExplorer}
                        onHide={onHideSourceExplorer}
                        knowledgeBase={knowledgeBase}
                        setKnowledgeBase={setKnowledgeBase}
                        categories={categoryOptions}
                        formats={formatOptions}
                        isDeleting={isDeleting}
                        clickedIndex={clickedIndex}
                        onThumbnailClick={onThumbnailClick}
                        deleteResource={deleteResource}
                        handleCheckboxChange={handleCheckboxChange}
                        handleSelectAllCheckboxChange={handleSelectAllCheckboxChange}
                        isOpenedFromSourceExplorerBtn={isOpenedFromSourceExplorerBtn}
                        className="modal"
                    />
                )}

                <CategoriesModal
                    show={showCategoriesModal}
                    onHide={() => setShowCategoriesModal(false)}
                    categoryOptions={categoryOptions}
                    setShowFileFormatsModal={setShowFileFormatsModal}
                />

                <FileFormatsModal
                    handleupload={handleUpload}
                    show={showFileFormatsModal}
                    onHide={() => setShowFileFormatsModal(false)}
                />

                <BaseHeading text='Selected sources' className="mt-2" />

                <div className="flex flex-col flex-1 w-full h-full overflow-y-hidden selected-sources-container">
                    {
                        knowledgeBase.some((item) => item.is_selected) > 0 && <div className={` grid grid-cols-[repeat(auto-fill,_112px)] h-full gap-5 justify-center items-start w-full max-w-full mx-auto mt-4 overflow-y-auto ${theme === 'dark' ? '!border !border-textColor-300' : 'border'} empty:!border-none`}>
                            {knowledgeBase.slice(0).reverse().map((item, index) => {
                                if (canRenderSourceThumbnail(item)) {
                                    return (<ContentPanelThumbnail
                                        key={index}
                                        index={index}
                                        isDeleting={isDeleting}
                                        clickedIndex={clickedIndex}
                                        item={item}
                                        handleCheckboxChange={handleCheckboxChange}
                                        onThumbnailClick={onThumbnailClick}
                                        deleteResource={deleteResource}
                                    />);
                                }
                            })}
                        </div>
                    }
                    {

                        knowledgeBase.some((item) => item.is_selected) > 0
                            ?
                            <>
                                <div className="mx-auto w-fit">
                                    <CustomButton onClick={commitSelectedSources} className="my-1 text-white bg-primary-300">Update sources</CustomButton>
                                </div>
                                <div className="mx-auto w-fit">
                                    <CustomButton onClick={handleUnselectAllCheckboxChange} className="my-0 text-primary-300">Unselect all sources</CustomButton>
                                </div>
                            </>
                            :
                            <NoData message="No sources selected" />
                    }
                </div>
            </section>
        </>
    );
};

export default ContentSection;
