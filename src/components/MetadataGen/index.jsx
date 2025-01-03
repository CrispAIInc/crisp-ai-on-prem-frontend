import MetadataAdvancedParams from '../MetadataAdvancedParams';
import MetadataOptions from "../MetadataOptions";

function MetadataGen() {
    return (
        <div className='z-20 flex flex-col gap-4'>
            <MetadataOptions />
            <MetadataAdvancedParams />
            <button className='w-full max-w-full py-2 m-auto text-center text-white rounded-md bg-primary-300/85 hover:bg-primary-300'>Generate</button>
        </div>
    );
}

export default MetadataGen;