import { useContext, useState } from 'react';
import makeApiRequest from '../../api';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import './note_modal.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';

export function NoteModal({ onHide,
  existingNote,
  show }) {

  const {
    selectedNote,
    theme,
    setNotes,
    isNewNote } = useContext(MainContext);

  const [HTMLToDisplay] = useState('');


  const handleSave = async (event) => {
    event.preventDefault();
    if (isNewNote) {
      const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      selectedNote.note_id = dateTimeStr;
    }
    try {
      await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote: { ...selectedNote, note_name: currentNoteTitle }, noteName: 'note_json', noteNumber: parseInt(existingNote + 1), isNewNote: isNewNote });
      const data = await makeApiRequest("/notes", "post");
      setNotes(data);

    } catch (error) {
      console.log(error);
    } finally {
      setCurrentNoteTitle(selectedNote.note_name);
      onHide();
    }
  };

  const handleDelete = async () => {
    try {
      await makeApiRequest(`/delete-note`, 'post', { noteID: selectedNote.note_id, noteName: selectedNote.note_name });
    } catch (error) {
      console.log(error);
    }
    onHide();
  };

  const distinctModels = [];
  const modelSet = new Set();

  selectedNote.text?.forEach(item => {
    if (item.model && !modelSet.has(item.model)) {
      modelSet.add(item.model);
      distinctModels.push(item.model);
    }
  });

  const [currentNoteTitle, setCurrentNoteTitle] = useState(selectedNote.note_name);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      scrollable={true}
      centered

    >
      <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
        <Modal.Title id="contained-modal-title-vcenter">
          <div className="flex items-center gap-3">
            <CustomInput className="py-0" placeholder='Note title' value={currentNoteTitle} onChange={(e) => setCurrentNoteTitle(e.target.value)} />
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`overflow-hidden ${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
        {<ReactQuill className='#editor' theme="snow" value={HTMLToDisplay} onChange={(newHtmlContent) => handleTextChange(newHtmlContent)} />}
        <div className="flex flex-wrap items-center gap-4 my-3">
          {
            distinctModels?.map((model, index) => {
              const modelColor = `bg-${model?.toUpperCase()}-200`;
              return (
                <div key={index} className="flex items-center gap-1">
                  <span className={`w-3 h-3 ${modelColor}`}></span><span>{model?.toUpperCase()}</span>
                </div>
              );
            })
          }
        </div>
      </Modal.Body>
      <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
        {<Button className='delete-note-btn' onClick={handleDelete}><DeleteIcon /></Button>}
        <Button onClick={handleSave}> <SaveIcon /> </Button>
      </Modal.Footer>
    </Modal>
  );
}