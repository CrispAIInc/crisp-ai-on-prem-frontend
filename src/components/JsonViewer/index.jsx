import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';


const JsonViewerStyle = { display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' };

const JsonViewer = ({ data }) => {

    const { theme } = useContext(MainContext);

    return (
        <div style={JsonViewerStyle}>
            <JsonView value={data} style={theme === 'dark' ? darkTheme : lightTheme} />
        </div>
    );
};

export default JsonViewer;