import { useContext, useState } from "react";
import makeApiRequest from "../../api";
import Modal from 'react-bootstrap/Modal';
import { MainContext } from "../../contexts/mainContext";
import LoadingSpinner from "../LoadingSpinner";
import toast from 'react-simple-toasts';

export default function UpdateFilenameModal({ show, onHide, value, setValue, label, reel }) {
    const { theme, setReels } = useContext(MainContext);
    const [isLoading, setIsLoading] = useState(false);

    async function update() {
        try {
            if (value === "") {
                toast('value cannot be empty', { className: `p-2 rounded-md !bg-red-600 text-white`, theme });
                return;
            }

            setIsLoading(true);

            const payload = {
                reelId: reel.id,
                videoUrl: reel.reel_video_url,
                newTitle: value?.trim()
            };
            await makeApiRequest('/rename-reel', 'PATCH', JSON.stringify(payload));

            // update reel title in UI
            setReels(prevReels => prevReels.map(r => r.id === reel.id ? { ...r, title: value?.trim() } : r));
            onHide();
            toast('Reel renamed successfully', { className: `p-2 rounded-md bg-green-600 text-white`, theme });
        } catch (error) {
            console.log(error);
            toast('Something bad happened', { className: `p-2 rounded-md bg-red-600 text-white`, theme });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                        {label}
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type index name here'
                            id='indexName'
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && update()}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={update}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Save
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
};