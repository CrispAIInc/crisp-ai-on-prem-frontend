import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const JsonViewer = ({ data }) => {

    const { theme } = useContext(MainContext);

    return (
        <div>
            <JsonView
                value={data}
                style={theme === 'dark' ? darkTheme : lightTheme}
                theme="rjv-default"
                displayDataTypes={false}
            />
        </div>
    );
};

export default JsonViewer;