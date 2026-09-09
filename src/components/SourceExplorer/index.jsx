import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Bolt } from 'lucide-react';
import Checkbox from "@mui/material/Checkbox";
import { MainContext } from "../../contexts/mainContext.jsx";
import "./source_explorer.css";
import { ProjectContext } from '../../contexts/projectContext.jsx';
import BaseHeading from '../BaseHeading/index.jsx';
import SourceExplorerBody from '../SourceExplorerBody/index.jsx';

export function SourceExplorer(props) {
    const {
        selectedCategory,
        theme,
        sourcesTobeCommited,
        knowledgeBase,
        setKnowledgeBase,
    } = useContext(MainContext);

    const { isProjectReadOnly } = useContext(ProjectContext);

    const [isManagingSources, setIsManagingSources] = useState(false);
    const [filteredSourcesForSelectAll, setFilteredSourcesForSelectAll] = useState(knowledgeBase);

    const handleFilteredSourcesChange = (sources) => {
        setFilteredSourcesForSelectAll(sources);
    };

    useEffect(() => {
        setFilteredSourcesForSelectAll(knowledgeBase);
    }, [knowledgeBase, selectedCategory, sourcesTobeCommited]);

    const handleClose = () => {
        props.onHide();
    };

    const itemsFoundInsideCategoryOrFormat = knowledgeBase.length > 0;

    const areAllSourcesSelected =
        knowledgeBase.length > 0 &&
        knowledgeBase.every(item => item.is_selected);

    const handleToggleAllSources = () => {
        setKnowledgeBase(prev => {
            const shouldSelectAll = !areAllSourcesSelected;

            return prev.map(item => ({
                ...item,
                is_selected: shouldSelectAll
            }));
        });
    };

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
                        <BaseHeading text="Media Explorer" className="text-xl" />
                        <p className="text-slate-400 text-sm mt-0.5">Select assets to add to your workspace, enabling metadata extraction and deeper insights.</p>
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
                    onFilteredSourcesChange={handleFilteredSourcesChange}
                />
            </Modal.Body>

            <Modal.Footer className={`${itemsFoundInsideCategoryOrFormat && 'flex !items-center !justify-between'}  ${theme === "dark" && "!bg-textColor-300 !text-white !border-t !border-t-textColor-200/20"} z-20`}>
                {/* {itemsFoundInsideCategoryOrFormat && (
                    <div
                        className={`flex items-center gap-1 cursor-pointer px-1 py-1.5 rounded-md ${theme === 'light' ? 'hover:bg-primary-100/50' : 'hover:bg-primary-100/15'}`}
                        onClick={() => props.handleSelectAllCheckboxChange(filteredSourcesForSelectAll, !filteredSourcesForSelectAll.every(item => item.is_checked))}
                    >
                        <Checkbox
                            className={`p-0 !border-primary-300 !text-primary-300`}
                            checked={filteredSourcesForSelectAll.length > 0 && filteredSourcesForSelectAll.every(item => item.is_checked)}
                            onChange={(e) => props.handleSelectAllCheckboxChange(filteredSourcesForSelectAll, e.target.checked)}
                            inputProps={{ "aria-label": "Select all sources" }}
                            label="Select All Sources"
                        />
                        <BaseHeading text="Select all sources" />
                    </div>
                )} */}

                <div
                    className={`flex items-center gap-1 cursor-pointer px-2 py-1.5 rounded-md ${theme === 'light' ? 'hover:bg-primary-100/50' : 'hover:bg-primary-100/15'}`}
                    onClick={handleToggleAllSources}
                >
                    {/* <Checkbox
                        className={`p-0 !border-primary-300 !text-primary-300`}
                        checked={areAllSourcesSelected}
                        onChange={handleToggleAllSources}
                        inputProps={{ "aria-label": "Select all sources" }}
                        label="Select All Sources"
                    /> */}
                    <BaseHeading className="!text-primary-300" text={`${areAllSourcesSelected ? 'Unselect' : 'Select'} all assets`} />
                </div>
                <div
                    className={`flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-primary-100/50' : 'hover:bg-primary-100/15'}`}
                    onClick={props.onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Done</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default SourceExplorer;
