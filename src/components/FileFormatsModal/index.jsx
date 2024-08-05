import { useContext, useRef } from "react";

import Modal from 'react-bootstrap/Modal';

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import { MainContext } from '../../contexts/mainContext';

const FORMATS = [
    {
        name: "PDF",
        icon: <InsertDriveFileOutlinedIcon />,
        extensions: [".pdf"],
        value: "pdf"
    },
    {
        name: "Image",
        icon: <InsertPhotoOutlinedIcon />,
        extensions: [".jpg", ".jpeg", ".png"],
        value: "img"
    },
    {
        name: "Video",
        icon: <SlideshowOutlinedIcon />,
        extensions: [".mp4"],
        value: "video"
    }
];

function FileFormatsModal(props) {

    const { setSelectedFormat, theme } = useContext(MainContext);

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
                        FORMATS.map((format, index) => (
                            <div key={index} className='flex items-center justify-center gap-2 cursor-pointer' onClick={() => handleFileFormatClick(index)}>
                                {format.icon}
                                <span>{format.name}</span>
                                {/* file input */}
                                <input
                                    type="file"
                                    ref={(el) => (fileFormatInputRefs.current[index] = el)}
                                    accept={format.extensions.join(', ')}
                                    name={format.name}
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