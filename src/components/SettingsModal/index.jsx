import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { MainContext } from '../../contexts/mainContext';

export function SettingsModal(props) {

    const { theme } = useContext(MainContext);

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="note-modal"
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter" className="flex items-center justify-between py-3">
                    <p>Settings</p>
                    <span>&times;</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div>
                    {
                        ["General", "Account", "Privacy", "Notifications"].map((setting, index) => (
                            <div key={index} className={`py-2 px-3 rounded-md mb-2 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{setting}</p>
                            </div>
                        ))
                    }
                </div>
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
