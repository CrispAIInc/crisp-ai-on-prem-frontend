import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import './llm_modal.css';

export function LLMModal(props) {
    const [selectionCategory, setSelectionCategory] = useState(null); // State to track the selected category

    const handleCheckboxChange = (model) => {
        const category = model.type; // Determine the category of the selected model
        props.setSelectedLLMs(prev => {
            // If the model is already selected, remove it and potentially clear the selection category
            if (prev.includes(model.value)) {
                const newSelection = prev.filter(m => m !== model.value);
                // If after removing the model, no other model of the same category is selected, allow all categories again
                if (!newSelection.some(m => props.llmModels.find(model => model.value === m).type === category)) {
                    setSelectionCategory(null);
                }
                return newSelection;
            } else {
                // Add the model and restrict selection to this category
                setSelectionCategory(category);
                return [...prev, model.value];
            }
        });
    };

    const isCheckboxDisabled = (modelType) => {
        // Disable checkboxes not matching the selected category, if a category has been selected
        return selectionCategory && modelType !== selectionCategory;
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="note-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Select LLM Models
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className='overflow-hidden'>
                <Form className='me-auto d-sm-inline-block'>
                    <ul className='list-unstyled ms-5'>
                        <li>
                            <h3 className='fs-5'>Large Language Models</h3>
                            <div className="border-start ps-3 ms-3 w-auto">
                                {props.llmModels.map((model, index) => (
                                    model.type === "llm" &&
                                    <Form.Check
                                        key={index}
                                        type="checkbox"
                                        label={model.label}
                                        disabled={isCheckboxDisabled(model.type)}
                                        checked={props.selectedLLMs.includes(model.value)}
                                        onChange={() => handleCheckboxChange(model)} />
                                ))}
                            </div>
                        </li>
                        <li>
                            <h3 className='mt-4 fs-5'>Large Vision Models</h3>
                            <div className="border-start ps-3 ms-3 w-auto">
                                {props.llmModels.map((model, index) => (
                                    model.type === "lvm" &&
                                    <Form.Check
                                        key={index}
                                        type="checkbox"
                                        label={model.label}
                                        disabled={isCheckboxDisabled(model.type)}
                                        checked={props.selectedLLMs.includes(model.value)}
                                        onChange={() => handleCheckboxChange(model)}
                                    />
                                ))}
                            </div>
                        </li>
                        <li>
                            <h3 className='mt-4 fs-5'>Image Generation Models</h3>
                            <div className="border-start ps-3 ms-3 w-auto">
                                {props.llmModels.map((model, index) => (
                                    model.type === "image-generation" &&
                                    <Form.Check
                                        key={index}
                                        type="checkbox"
                                        label={model.label}
                                        disabled={isCheckboxDisabled(model.type)}
                                        checked={props.selectedLLMs.includes(model.value)}
                                        onChange={() => handleCheckboxChange(model)}
                                    />
                                ))}
                            </div>
                        </li>
                    </ul>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
