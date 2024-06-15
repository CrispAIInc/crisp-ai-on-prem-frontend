import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { MainContext } from '../../contexts/mainContext';

export function LLMModal(props) {

    const { theme } = useContext(MainContext);

    const [selectionCategory, setSelectionCategory] = useState(null); // State to track the selected category

    const handleCheckboxChange = (model) => {
        const category = model.type; // Determine the category of the selected model
        props.setSelectedLLMs(prev => {
            // only accept one model to be checked, and when one model is check, disable all other models
            // If no category is selected, allow all categories
            // if (!selectionCategory) {
            //     return [...prev, model.value];
            // }
            if (prev.includes(model.value)) {
                setSelectionCategory(null);
                return [];
            } else {
                setSelectionCategory(category);
                return [model.value];
            }


            // If the model is already selected, remove it and potentially clear the selection category
            // if (prev.includes(model.value)) {
            //     const newSelection = prev.filter(m => m !== model.value);
            //     // If after removing the model, no other model of the same category is selected, allow all categories again
            //     if (!newSelection.some(m => props.llmModels.find(model => model.value === m).type === category)) {
            //         setSelectionCategory(null);
            //     }
            //     return newSelection;
            // } else {
            //     // Add the model and restrict selection to this category
            //     setSelectionCategory(category);
            //     return [...prev, model.value];
            // }
        });
    };

    const isCheckboxDisabled = (modelType, modelValue) => {
        // Ensure there's a selected LLM
        const selectedLLM = props.selectedLLMs.length > 0 ? props.selectedLLMs[0] : null;

        // If there's a selected category, disable checkboxes that do not match the category
        if (selectionCategory && modelType !== selectionCategory) {
            return true;
        }

        // If there's a selected LLM, disable checkboxes that do not match the selected LLM
        if (selectedLLM && modelValue !== selectedLLM) {
            return true;
        }

        // Otherwise, keep the checkbox enabled
        return false;
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
                                        // disabled={isCheckboxDisabled(model.type, model.value)}
                                        checked={props.selectedLLMs.includes(model.value)}
                                        onChange={() => handleCheckboxChange(model)}
                                        className={`${theme === 'dark' && 'text-textColor-100'}`} />
                                ))}
                            </div>
                        </li>
                        <li>
                            <h3 className={`mt-4 fs-5 ${theme == 'dark' && 'text-textColor-100'}`}>Large Vision Models</h3>
                            <div className="w-auto border-start ps-3 ms-3">
                                {props.llmModels.map((model, index) => (
                                    model.type === "lvm" &&
                                    <Form.Check
                                        key={index}
                                        type="radio"
                                        label={model.label}
                                        // disabled={isCheckboxDisabled(model.type, model.value)}
                                        checked={props.selectedLLMs.includes(model.value)}
                                        onChange={() => handleCheckboxChange(model)}
                                        className={`${theme === 'dark' && 'text-textColor-100'}`}
                                    />
                                ))}
                            </div>
                        </li>
                        <li>
                            <h3 className={`mt-4 fs-5 ${theme == 'dark' && 'text-textColor-100'}`}>Image Generation Models</h3>
                            <div className="w-auto border-start ps-3 ms-3">
                                {props.llmModels.map((model, index) => (
                                    model.type === "image-generation" &&
                                    <Form.Check
                                        key={index}
                                        type="radio"
                                        label={model.label}
                                        // disabled={isCheckboxDisabled(model.type, model.value)}
                                        checked={props.selectedLLMs.includes(model.value)}
                                        onChange={() => handleCheckboxChange(model)}
                                        className={`${theme === 'dark' && 'text-textColor-100'}`}
                                    />
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
