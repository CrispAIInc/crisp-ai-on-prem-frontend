import React from 'react';
import Select from 'react-select';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const AddOptionsModal = ({ text, addToNewNote, addToExistingNote, setExistingNote, notes, showNoteModal }) => {
  console.log("text", text);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      <Button onClick={handleOpen}><AddCircleIcon /></Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button onClick={() => { addToNewNote(text); handleClose(); }}>Add to a new note</Button>
          <Button onClick={() => { addToExistingNote(text); handleClose(); }}>Add to an existing note</Button>
          <Select className='note-select'
            defaultValue={1} onChange={(e) => { setExistingNote(e.value); console.log('existing note', e.value); }} options={notes.map((note, i) => ({ value: i, label: note.note_name }))} />
        </Box>
      </Modal>
      {console.log(showNoteModal)}
    </div>
  );
};

export default AddOptionsModal;
