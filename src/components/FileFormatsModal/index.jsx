import { useContext, useRef } from "react";

import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';



function FileFormatsModal(props) {

    const { setSelectedFormat, theme, fileFormats } = useContext(MainContext);

    const fileFormatInputRefs = useRef([]);

    const handleFileFormatClick = (index) => {
        fileFormatInputRefs.current[index].click();
    };

    const handleOnChange = (e, format) => {
        setSelectedFormat(format);
        props.handleupload(e, format);
        props.onHide();
    };

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white border-b-none'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    Upload from
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className='flex flex-col items-start justify-start gap-3'>
                    {
                        [...fileFormats, {
                            label: "All of the above",
                            icon: <LibraryAddOutlinedIcon />,
                            extensions: [".pdf", "image/*", "video/*"],
                            value: "all"
                        }].map((format, index) => (
                            <div key={index} className='flex items-center justify-center gap-2 cursor-pointer' onClick={() => handleFileFormatClick(index)}>
                                {format.icon}
                                <span>{format.label}</span>
                                {/* file input */}
                                <input
                                    type="file"
                                    ref={(el) => (fileFormatInputRefs.current[index] = el)}
                                    accept={format.extensions.join(', ')}
                                    name={format.label}
                                    multiple
                                    onChange={(e) => handleOnChange(e, format.value)}
                                    className='hidden'
                                />
                            </div>
                        ))
                    }
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default FileFormatsModal;