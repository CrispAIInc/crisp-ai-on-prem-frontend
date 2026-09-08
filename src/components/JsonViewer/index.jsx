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
        graph_id,
        title,
        ...entity
    } = rest || {};

    return (
        <div>
            {entity ? (
                <JsonView
                    value={entity?.graph}
                    style={theme === 'dark' ? darkTheme : lightTheme}
                    theme="rjv-default"
                    displayDataTypes={false}
                />
            ) : (
                <p>json viewer not ready</p>
            )
            }
        </div>
    );
};

export default JsonViewer;