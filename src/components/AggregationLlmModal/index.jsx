import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingSpinner from '../LoadingSpinner';

function AggregationLlmModal(props) {

    const { theme, llmModels } = useContext(MainContext);
    const AGGREGATE_LLMS = llmModels.filter((llm) => llm.type === 'llm');

    const isCheckboxDisabled = (model) => {
        // disable if model.value is llama-2, gemini-pro
        return model.value === 'llama-2' || model.value === 'gemini-pro';
    };

    return (
        <Modal
            show={props.isLlmAggregationModalOpen}
            onHide={() => props.setIsAggregationModalOpen(false)}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white border-b-none'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    Aggregating LLM
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className='flex flex-col items-start justify-start gap-3'>
                    {
                        AGGREGATE_LLMS.map((llm, index) => (
                            <div key={index} className='flex items-center justify-center gap-2 cursor-pointer'>
                                <Form.Check
                                    key={index}
                                    type="radio"
                                    label={llm.label}
                                    checked={llm.value === props.llmAggregation}
                                    onChange={() => {
                                        // if the used checked this llm, then set is to be the selected llm otherwide not
                                        props.setLlmAggregation(prev => {
                                            return prev === llm.value ? '' : llm.value;
                                        });
                                    }}
                                    disabled={isCheckboxDisabled(llm) || props.isPending}
                                    className={`${theme === 'dark' && 'text-textColor-100'}`} />
                            </div>
                        ))
                    }
                </div>
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={() => props.aggregateInsight()}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        {props.isPending ? <LoadingSpinner videoSpinner={true} /> : 'Aggregate'}
                    </span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default AggregationLlmModal;