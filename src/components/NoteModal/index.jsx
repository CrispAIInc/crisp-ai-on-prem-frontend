import { useContext, useEffect, useState } from 'react';
import makeApiRequest from '../../api';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import './note_modal.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MainContext } from '../../contexts/mainContext';

export function NoteModal({ onHide,
  existingNote,
  show, }) {

  const {
    selectedNote,
    setSelectedNote,
    notes,
    isNewNote, } = useContext(MainContext);

  const [HTMLToDisplay, setHTMLToDisplay] = useState('');

  useEffect(() => {
    console.log(selectedNote.text);
    if (selectedNote.text) {
      const htmlString = selectedNote.text.map(item => `<span style="color: ${item.color};">${item.content}</span>`).join('');
      setHTMLToDisplay(htmlString);
    }
  }, [selectedNote.text]);

  const handleTextChange = (newHtmlContent) => {
    // Update the local state or prepare the content for saving
    setHTMLToDisplay(newHtmlContent);
    Array.isArray(selectedNote.text) ? selectedNote.text[selectedNote.text.length - 1].content = newHtmlContent : selectedNote.text = newHtmlContent;
  };


  const handleSave = async (event) => {
    event.preventDefault();
    if (isNewNote) {
      const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      // const noteFilename = `${dateTimeStr}.json`;
      selectedNote.note_id = dateTimeStr;
    }
    try {
      const response = await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote: selectedNote, noteName: 'note_json', noteNumber: parseInt(existingNote + 1), isNewNote: isNewNote });
      if (response.status === 200) {
        console.log('selectedNote saved !');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedNote({
        note_id: "",
        text: [{ content: "", model: null, color: "#000" }],
        images: [],
        note_name: "Note " + parseInt(notes.length + 1),
      });
      onHide();
    }
  };

  // const handleClose = () => {
  //   onHide();
  // };

  const handleDelete = async () => {
    try {
      const response = await makeApiRequest(`/delete-note`, 'post', { noteID: selectedNote.note_id, noteName: selectedNote.note_name });
      if (response.status === 200) {
        console.log('selectedNote deleted !');
      }
    } catch (error) {
      console.log(error);
    }
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      scrollable={true}
      centered
      className="note-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {selectedNote.note_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {<ReactQuill className='#editor' theme="snow" value={HTMLToDisplay} onChange={(newHtmlContent) => handleTextChange(newHtmlContent)} />}
      </Modal.Body>
      <Modal.Footer>
        {<Button className='delete-note-btn' onClick={handleDelete}><DeleteIcon /></Button>}
        <Button onClick={handleSave}> <SaveIcon /> </Button>
      </Modal.Footer>
    </Modal>
  );
}