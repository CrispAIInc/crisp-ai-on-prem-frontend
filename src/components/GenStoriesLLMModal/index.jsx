import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { MainContext } from '../../contexts/mainContext';

function GenStoriesLLMModal(props) {

    const { theme, setSelectedGenStoriesModels } = useContext(MainContext);
    const isCheckboxDisabled = (model) => {
        // disable if model.value is llama-2, gemini-pro
        return model.value === 'llama-2' || model.value === 'gemini-pro';
    };

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
                <Modal.Title id="contained-modal-title-vcenter">
                    Select LLM Models
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <Form className='me-auto d-sm-inline-block'>
                    <ul className='list-unstyled ms-5'>
                        <li>
                            <h3 className={`fs-5 ${theme == 'dark' && 'text-textColor-100'}`}>Large Language Models</h3>
                            <div className="w-auto border-start ps-3 ms-3">
                                {props.llmModels.map((model, index) => (
                                    model.type === "llm" &&
                                    <Form.Check
                                        key={index}
                                        type="radio"
                                        label={model.label}
                                        disabled={isCheckboxDisabled(model)}
                                        checked={props.selectedGenStoriesModels.includes(model.value)}
                                        onChange={() => setSelectedGenStoriesModels([model.value])}
                                        className={`${theme === 'dark' && 'text-textColor-100'}`} />
                                ))}
                            </div>
                        </li>
                    </ul>
                </Form>
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

export default GenStoriesLLMModal;