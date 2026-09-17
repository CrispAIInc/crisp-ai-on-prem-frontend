import { useContext, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import { useToast } from "../../contexts/toastContext";
import LoadingSpinner from "../LoadingSpinner";


import 'react-tooltip/dist/react-tooltip.css';


export default function UpdateFilenameModal({ show, onHide, filename, setFilename, extension, oldFilename, onUpdated }) {
    const { theme, knowledgeBase, setKnowledgeBase } = useContext(MainContext);

    const { notify } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const isTitleValid = filename.trim().length > 0;

    async function updateFilename() {
        try {
            if (!isTitleValid) {
                notify({
                    variant: "error",
                    heading: "Oops!",
                    subheading: "Filename cannot be empty.",
                });
                return;
            }

            setIsLoading(true);

            const payload = {
                newFilename: filename + "." + extension,
            };
            const response = await makeApiRequest(`/assets/${knowledgeBase.find(item => item.source_path === oldFilename)?.source_id}`, 'PATCH', JSON.stringify(payload));

            const mediaKey = ['video_url', 'pdf_url', 'thumbnail'].find(key => response[key]);

            setKnowledgeBase(prev => {
                return prev.map(item => {
                    if (item.source_path === oldFilename) {
                        return {
                            ...item,
                            ...(response.thumbnail ? { thumbnail: response.thumbnail } : {}),
                            ...(mediaKey ? { [mediaKey]: response[mediaKey] } : {}),
                            source_path: `${filename}.${extension}`
                        };
                    }
                    return item;
                });
            });
            onUpdated?.({
                oldFilename,
                newFilename: `${filename}.${extension}`,
                response,
            });
            onHide();
            notify({
                variant: "success",
                heading: "Source renamed successfully!",
            });
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Something bad happened",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                <div className="flex flex-col gap-1">
                    <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                        Rename asset
                    </Modal.Title>
                    <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Choose a clear filename for this asset before saving.
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        asset filename
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type a new source name here'
                            id='indexName'
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1  rounded-xl outline-none transition ${theme === 'dark'
                                ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                : '!border !border-gray-300 bg-white text-gray-900'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && isTitleValid && updateFilename()}
                        />
                        <span className={`${theme === 'light' ? 'text-textColor-100' : 'text-textColor-200'}`}>.{extension}</span>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </button>

                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!isTitleValid || isLoading
                        ? 'cursor-not-allowed text-gray-400'
                        : theme === 'dark'
                            ? 'hover:bg-purple-500/20 text-purple-300'
                            : 'hover:bg-purple-50 text-purple-600'}`}
                    onClick={isTitleValid ? updateFilename : undefined}
                    disabled={!isTitleValid || isLoading}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium`}>
                        Save title
                    </span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
}