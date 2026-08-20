import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import GeneralSettings from '../GeneralSettings';
import AccountSettings from "../AccountSettings";
import { ProjectContext } from '../../../contexts/projectContext.jsx';

import CloseIcon from '@mui/icons-material/Close';

export function SettingsModal(props) {

    const { theme } = useContext(ProjectContext);

    const [activeTab, setActiveTab] = useState("General");

    const renderActiveSettingsTab = () => {
        switch (activeTab) {
            case "General":
                return <GeneralSettings hideTheme={props?.hideTheme} />;
            case "Account":
                return <AccountSettings />;
            default:
                return null;
        }
    };

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="note-modal rounded-3xl"
            dialogClassName="settings-modal-dialog custom-rounded"
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'} settings-modal-body pb-5 flex flex-col`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xl">
                        {
                            ["General", "Account"].map((setting, index) => (
                                <div key={index} onClick={() => setActiveTab(setting)} className={`cursor-pointer py-2 px-3 rounded-md mb-2 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}>
                                    <p className={` ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${setting === activeTab && `font-bold !text-primary-300`}`}>{setting}</p>
                                </div>
                            ))
                        }
                    </div>

                    <div
                        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={props.onHide}
                    >
                        <CloseIcon className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                    </div>
                </div>
                <div className={`settings-modal-scroll mt-4 text-gray-700 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-900'}`}>{renderActiveSettingsTab()}</div>
            </Modal.Body>
        </Modal>
    );
}
