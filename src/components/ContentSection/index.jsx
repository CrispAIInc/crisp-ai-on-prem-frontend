import { useContext, useEffect, useState } from "react";

import makeApiRequest from "../../api";

import SearchIcon from "@mui/icons-material/Search";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SourceExplorer from "../SourceExplorer";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import FileFormatsModal from "../FileFormatsModal";
import CategoriesModal from "../CategoriesModal";
import ContentPanelThumbnail from "../ContentPanelThumbnail";
import { MainContext } from "../../contexts/mainContext";
import VideoThumbnail from "../VideoThumbnail";
import PDFThumbnail from "../PDFThumbnail";
import ImageThumbnail from "../ImageThumbnail";
import { Checkbox } from "@mui/material";
import LoadingSpinner from "../LoadingSpinner";
import DeleteIcon from "@mui/icons-material/Delete";
import BaseHeading from '../BaseHeading';
import NoData from '../NoData';
import CustomButton from '../CustomButton';

const ContentSection = ({
    onThumbnailClick,
    handleCheckboxChange,
    knowledgeBase,
    setKnowledgeBase,
}) => {
    const {
        isPlayerReady,
        resourceURL,
        currentResource,
        setCurrentResource,
        player,
        selectedCategory,
        selectedFormat,
        selectedSources,
        setSelectedSources,
        selectedAll,
        setSelectedAll,
        theme
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

    const [showSourceExplorer, setShowSourceExplorer] = useState(false);
    const [isAtLeastOneSourceSelected, setIsAtLeastOneSourceSelected] = useState(selectedSources.length > 0);
    const [showFileFormatsModal, setShowFileFormatsModal] = useState(false);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    // const [knowledgeBase, setKnowledgeBase] = useState([]); // Knowledge Base (Videos, Pdfs, Docs, etc) metadata
    const [isDeleting, setIsDeleting] = useState(false); // True when a resource is being deleted
    const [clickedIndex, setClickedIndex] = useState(0);
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
            const timestamp = currentResource.timestamp; // Make sure you have the timestamp here
            if (timestamp && Number.isInteger(+timestamp))
                player.current.seekTo(timestamp);
            else;
        }
    }, [isPlayerReady]);

    useEffect(() => {
        // Check if every item in knowledgeBase is selected
        const allSelected = knowledgeBase.every((item) => item.is_selected);

        // Update selectedAll state based on the check
        setSelectedAll(allSelected);
    }, [knowledgeBase]);

    const deleteResource = async (event, idx) => {
        try {
            setIsDeleting(true);
            setClickedIndex(idx);

            const requestBody = {
                category: selectedCategory,
                fileName: knowledgeBase[idx].source_path,
                fileType: knowledgeBase[idx].file_type,
            };

            await makeApiRequest(`/delete`, "post", requestBody);
            setIsDeleting(false);

            const data = await makeApiRequest(
                `/content`,
                "post",
                JSON.stringify(categoryValues)
            );
            setKnowledgeBase(data);
            // remove resource from workspace after deleting it
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
                setSelectedSources((prev) => [
                    ...prev,
                    {
                        source_path: item.source_path,
                        category: item.category,
                        file_type: item.file_type,
                    },
                ]);
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

    const handleSelectAllCheckboxChange = () => {
        const newSelectedValue = !selectedAll;
        setSelectedAll(newSelectedValue);
        knowledgeBase.forEach((item) => {
            item.is_selected = newSelectedValue;
        });
    };

    /**
     * Function to indicate wether a source thumbnail can be rendered in the selected sources section or not
     */
    const canRenderSourceThumbnail = (source) => {
        return (source.category.includes(selectedCategory) || selectedCategory === "all") &&
            (source.file_type === selectedFormat || selectedFormat === "all") &&
            source.is_selected;
    };

    return (
        <div className='relative flex flex-col items-start'>

            <div className="mb-11">
                {/* New resource */}
                <div>
                    {
                        isUploading ? <LoadingSpinner videoSpinner={true} /> :
                            <div
                                className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                                onClick={handleAddNewResource}
                            >
                                <AddOutlinedIcon />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>New Source</span>
                            </div>
                    }
                </div>

                {/* resource explorer */}
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={handleExploreSources}
                >
                    <SearchOutlinedIcon />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Source Explorer</span>
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

            <BaseHeading text='Selected sources' />

            {
                <div className="flex flex-col w-4/5 max-w-full gap-8 overflow-y-auto">
                    {knowledgeBase.map((item, index) => {
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
                knowledgeBase.some((item) => item.is_selected) > 0 ?
                    <div className="sticky left-[25%] bottom-5">
                        <CustomButton onClick={commitSelectedSources} className="text-white bg-primary-300">Update sources</CustomButton>
                    </div> : <NoData />
            }
        </div>
    );
};

export default ContentSection;
