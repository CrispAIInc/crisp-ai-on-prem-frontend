import React, { useContext } from 'react';
import Select from 'react-select';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { MainContext } from '../../contexts/mainContext';

const AddOptionsModal = ({ text, file, addToNewNote, addToExistingNote, refs, question, models }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { theme, notes, setSelectedNote } = useContext(MainContext);

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

  function handleNoteChange(e) {
    // setExistingNote(e.value);
    const insight = notes[e.value];
    setSelectedNote(insight);
  }
  return (
    <div>

      <Button onClick={handleOpen}><AddCircleIcon /></Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className={`${theme === 'light' ? '!border-none' : '!bg-textColor-300 !text-white !border-b-none'}`}>
          <div
            className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
            onClick={() => { addToNewNote(text, file, question, models, refs); handleClose(); }}
          >
            <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Add to a new insight</span>
          </div>

          <div
            className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
            onClick={() => { addToExistingNote(text, file, question, models, refs); handleClose(); }}
          >
            <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} mb-4`}>Add to an existing insight</span>
          </div>
          <Select className='note-select' styles={{
            option: provided => ({
              ...provided,
              color: '#333333'
            }),
          }}
            defaultValue={1} onChange={(e) => { handleNoteChange(e); }} options={notes.map((note, i) => ({ value: i, label: note.note_name }))} />
        </Box>
      </Modal>
    </div>
  );
};

export default AddOptionsModal;
