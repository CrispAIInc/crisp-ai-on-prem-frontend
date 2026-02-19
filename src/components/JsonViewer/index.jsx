import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const JsonViewer = () => {

    const { theme, selectedKnowledgeGraph } = useContext(MainContext);

    return (
        <div>
            <JsonView
                value={selectedKnowledgeGraph.entities}
                style={theme === 'dark' ? darkTheme : lightTheme}
                theme="rjv-default"
                displayDataTypes={false}
            />
        </div>
    );
};

export default JsonViewer;