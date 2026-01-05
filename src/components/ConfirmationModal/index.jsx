import Modal from "react-bootstrap/Modal";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import LoadingSpinner from '../LoadingSpinner';

export default function ConfirmationModal({ show, onHide, heading, subheading, confirmedFn, isDeleting }) {
    const { theme } = useContext(MainContext);

    if (!show) return null;

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

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col items-center justify-center">
                    <ErrorOutlineIcon className="text-red-500 !text-[60px]" />
                    {/* <div className="flex flex-col gap-1"> */}
                    <h2 className="text-2xl font-bold">{heading}</h2>
                    <p className="w-2/3 mx-auto text-center text-md">{subheading}</p>
                    {/* </div> */}
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-2 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit py-2 px-3 ${theme === 'light' ? 'bg-textColor-100/10' : 'bg-textColor-100/20'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        No, Keep it.
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit bg-red-500 text-white py-2 px-3`}
                    onClick={confirmedFn}
                >
                    {
                        isDeleting ? <div className="flex items-center gap-1">
                            <LoadingSpinner isSmall />
                            <span className={`select-none font-medium `}>Deleting...</span>
                        </div> : <span className={`select-none font-medium `}>Yes, Delete!</span>
                    }
                </div>
            </Modal.Footer>
        </Modal>
    );
};