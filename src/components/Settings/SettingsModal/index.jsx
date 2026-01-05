import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../../contexts/mainContext.jsx';
import GeneralSettings from '../GeneralSettings';
import AccountSettings from "../AccountSettings";

export function SettingsModal(props) {

    const { theme } = useContext(MainContext);

    const [activeTab, setActiveTab] = useState("General");

    const renderActiveSettingsTab = () => {
        switch (activeTab) {
            case "General":
                return <GeneralSettings hideTheme={props?.hideTheme} />;
            case "Account":
                return <AccountSettings />;
            // case "Privacy":
            //     return <div>Privacy settings content goes here...</div>;
            // case "Notifications":
            //     return <div>Notifications settings content goes here...</div>;
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
            scrollable={true}
            centered
            className="note-modal rounded-3xl"
            dialogClassName="custom-rounded"
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter" className="flex items-center justify-between py-3">
                    <h3 className="mb-0 text-xl">Settings</h3>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex items-center gap-3 text-xl">
                    {
                        ["General", "Account"].map((setting, index) => (
                            <div key={index} className={`py-2 px-3 rounded-md mb-2 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}>
                                <h3 onClick={() => setActiveTab(setting)} className={`text-xl cursor-pointer hover:font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${setting === activeTab && 'text-gradient-x'}`}>{setting}</h3>
                            </div>
                        ))
                    }
                </div>

                <div className="mt-4 text-gray-700">{renderActiveSettingsTab()}</div>
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={props.onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
