import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

function AddToNewStoryModal({ open, handleClose }) {
    const { theme } = useContext(MainContext);



    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className={`${theme === 'light' ? '!border-none' : '!bg-textColor-300 !text-white !border-b-none'}`}>

                    <p>HERE GOES NEW FORM STORY</p>
                </Box>

            </Modal>
        </div>
    );
}

export default AddToNewStoryModal;