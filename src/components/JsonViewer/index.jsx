import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const JsonViewer = () => {

    const { theme, selectedJsonEntity } = useContext(MainContext);

    const {
        success,
        message,
        ...rest
    } = selectedJsonEntity || {};

    const {
        source_id,
        index_id,
        ...entity
    } = rest;

    return (
        <div>
            <JsonView
                value={entity}
                style={theme === 'dark' ? darkTheme : lightTheme}
                theme="rjv-default"
                displayDataTypes={false}
            />
        </div>
    );
};

export default JsonViewer;