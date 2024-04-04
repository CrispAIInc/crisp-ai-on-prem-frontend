import { useContext, useEffect, useRef } from "react";

import Modal from 'react-bootstrap/Modal';

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import { MainContext } from '../../contexts/mainContext';

/**
 * formats type: [{name: "string", icon: MuiIconComponent}]
 */

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
    },
    // {
    //     name: "Text file",
    //     icon: <TextSnippetOutlinedIcon />,
    //     extensions: [".txt"],
    //     value: "text"
    // }
];

function FileFormatsModal(props) {

    const { setSelectedFormat } = useContext(MainContext);

    const fileFormatInputRefs = useRef([]);

    const handleFileFormatClick = (index) => {
        fileFormatInputRefs.current[index].click();
    };

    const handleOnChange = (e, format) => {
        setSelectedFormat(format);
        // console.log("format: ", props.selectedFormat);
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
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Upload from
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
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