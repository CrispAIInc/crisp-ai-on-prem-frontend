import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PDFThumbnail from "../PDFThumbnail";
import LoadingSpinner from "../LoadingSpinner";
import { Bolt } from 'lucide-react';
import Checkbox from "@mui/material/Checkbox";
import { MainContext } from "../../contexts/mainContext.jsx";
import "./source_explorer.css";
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import StagedImageThumbnail from '../StagedImageThumbnail';
import { searchByKey, sortBySourcePath } from '../../utils';
import makeApiRequest from '../../api/index.js';
import UploadIcon from '@mui/icons-material/Upload';
import useResources from '../../hooks/useResources.js';
import { useToast } from "../../contexts/toastContext";
import ConfirmationModal from '../ConfirmationModal/index.jsx';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import BaseHeading from '../BaseHeading/index.jsx';
import SourceExplorerBody from '../SourceExplorerBody/index.jsx';

export function SourceExplorer(props) {
    const {
        selectedAll,
        selectedFormat,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        theme,
        sourcesTobeCommited,
        knowledgeBase,
        setCategoryOptions,
        categoryOptions
    } = useContext(MainContext);

    const { isProjectReadOnly } = useContext(ProjectContext);

    const { notify } = useToast();

    // const [currentPath, setCurrentPath] = useState('/');
    const [viewModes, setViewModes] = useState(["categories"]); // 'categories' or 'formats'
    const [results, setResults] = useState(knowledgeBase);
    const [history, setHistory] = useState(["/"]);
    const [currentPath, setCurrentPath] = useState(history[history.length - 1] || "/");
    const [isManagingSources, setIsManagingSources] = useState(false);

    function ge() {
        let filteredItems;
        const pathSegments = currentPath.split("/").filter(Boolean); // Removes empty strings from array
        const category = pathSegments[0];
        const format = pathSegments[1];

        if (!category && !format) {
            filteredItems = knowledgeBase; // Root `/` case: Select all items
        } else if (category && !format) {
            filteredItems = knowledgeBase.filter((item) => {
                return item.category.includes(category) || category === 'all';
            }
            ); // Category only
        } else {
            filteredItems = knowledgeBase.filter(item =>
                (item.category.includes(category) || category === 'all') && (item.file_type === format || format === 'all')
            ); // Category + Format
        }

        return filteredItems.length > 0 && filteredItems.every(item => item.is_checked);
    }


    const [isCheckedAll, setisCheckedAll] = useState(false);

    useEffect(() => {
        setisCheckedAll(ge());
    }, [currentPath, selectedCategory, selectedFormat, sourcesTobeCommited]);


    useEffect(() => {
        // update current path whenever selectedCategory changes in Parent component
        if (selectedCategory !== null && !props.isOpenedFromSourceExplorerBtn) {
            setViewModes((prevViewModes) => [...prevViewModes, "formats"]);
            setHistory([`/${selectedCategory}/`]);
        }
    }, [selectedCategory]);

    const handleClose = () => {
        setHistory(["/"]);
        setViewModes(["categories"]);
        props.onHide();
    };

    const handleOpenUploadCategoriesModal = () => {
        props.onHide();
        props.onOpenCategoriesModal?.();
    };

    const [itemsFoundInsideCategoryOrFormat, setItemsFoundInsideCategoryOrFormat] = useState(knowledgeBase.length > 0);

    // const handleSearch = (e) => {
    //     const value = e.target.value;
    //     setSearchValue(value);

    //     const filtered = searchByKey(knowledgeBase, "source_path", value);
    //     setKnowledgeBase(sortBySourcePath(filtered));
    // };
    return (
        <Modal
            show={props.show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="relative"
        >
            {/* <div className="w-56 h-56 bg-pink-400 rounded-full absolute left-1/2 top-10 z-10 blur-[180px]"></div>
            <div className="w-56 h-56 bg-purple-400 rounded-full absolute left-0 top-80 z-10 blur-[180px]"></div> */}

            <Modal.Header
                className={`${theme === "dark" && "bg-textColor-300 text-textColor-100 !border-b-textColor-200/20"} z-20`}
            >
                <div className="flex w-full items-center justify-between gap-3">
                    <Modal.Title id="contained-modal-title-vcenter" className="flex flex-col gap-0">
                        <BaseHeading text="Source Explorer" className="text-xl" />
                        <p className="text-slate-400 text-sm mt-0.5">Select sources to add to your workspace, enabling metadata extraction and deeper insights.</p>
                    </Modal.Title>
                    {!isProjectReadOnly && (
                        <button
                            type="button"
                            onClick={() => setIsManagingSources(!isManagingSources)}
                            className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold shadow-sm transition ${theme === "dark" ? "!border !border-textColor-200/20 bg-textColor-300 text-textColor-100 hover:bg-background_workspace" : "!border !border-slate-300/80 bg-white text-textColor-300 hover:bg-light-hover-100"} ${isManagingSources && '!font-bold !border-primary-200 !text-primary-300'}`}
                        >
                            <Bolt className="text-primary-300" size={20} />
                            <span className="text-sm">Manage</span>
                        </button>
                    )}
                </div>
            </Modal.Header>

            <Modal.Body
                className={`${theme === "light" ? "" : "bg-textColor-300 text-white"} z-20 overflow-hidden flex flex-col`}
            >
                <SourceExplorerBody
                    onHide={props.onHide}
                    showIndexModal={props.showIndexModal}
                    isDeleting={props.isDeleting}
                    clickedIndex={props.clickedIndex}
                    deleteResource={props.deleteResource}
                    onOpenCategoriesModal={props.onOpenCategoriesModal}
                    isManagingSources={isManagingSources}
                />
            </Modal.Body>

            <Modal.Footer className={`${itemsFoundInsideCategoryOrFormat && 'flex !items-center !justify-between'}  ${theme === "dark" && "!bg-textColor-300 !text-white !border-t !border-t-textColor-200/20"} z-20`}>
                {itemsFoundInsideCategoryOrFormat && (
                    <div
                        className={`flex items-center gap-1 cursor-pointer px-1 py-1.5 rounded-md ${theme === 'light' ? 'hover:bg-primary-100/50' : 'hover:bg-primary-100/15'}`}
                        onClick={() => {
                            setisCheckedAll(v => !v);
                            props.handleSelectAllCheckboxChange(currentPath, !isCheckedAll);
                        }}
                    >
                        <Checkbox
                            className={`p-0 !border-primary-300 !text-primary-300`}
                            checked={selectedAll || isCheckedAll}
                            onChange={(e) => props.handleSelectAllCheckboxChange(currentPath, e.target.checked)}
                            inputProps={{ "aria-label": "Select all sources" }}
                            label="Select All Sources"
                        />
                        <BaseHeading text="Select all sources" />
                    </div>
                )}
                <div
                    className={`flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-primary-100/50' : 'hover:bg-primary-100/15'}`}
                    onClick={props.onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Confirm</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default SourceExplorer;
