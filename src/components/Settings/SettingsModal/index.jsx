import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import GeneralSettings from '../GeneralSettings';
import AccountSettings from "../AccountSettings";

import {
    Settings,
    UserShield
} from "lucide-react";

import CloseIcon from '@mui/icons-material/Close';

export function SettingsModal(props) {

    const [activeTab, setActiveTab] = useState("General");

    const SETTINGS_NAV_LINKS = [
        {
            name: "General",
            icon: Settings
        },
        {
            name: "Account",
            icon: UserShield
        }
    ];

    const renderActiveSettingsTab = () => {
        switch (activeTab) {
            case "General":
                return <GeneralSettings />;
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

            <Modal.Body className={`settings-modal-body pb-5 flex flex-col`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xl">
                        {
                            SETTINGS_NAV_LINKS.map(({ name, icon: Icon }, index) => (
                                <div key={index} onClick={() => setActiveTab(name)} className={`cursor-pointer py-2 px-3 rounded-md mb-2 hover:bg-light-hover-100 flex items-center gap-1`}>
                                    <Icon size={17} className={`${name === activeTab && `!text-primary-300`}`} />
                                    <p className={`text-textColor-300 ${name === activeTab && `!text-primary-300`}`}>{name}</p>
                                </div>
                            ))
                        }
                    </div>

                    <div
                        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                        onClick={props.onHide}
                    >
                        <CloseIcon className={`text-textColor-300`} />
                    </div>
                </div>
                <div className={`settings-modal-scroll mt-4 text-gray-700 overflow-y-auto flex-1 min-h-0`}>{renderActiveSettingsTab()}</div>
            </Modal.Body>
        </Modal>
    );
}