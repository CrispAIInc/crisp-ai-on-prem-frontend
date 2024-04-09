const ModelChip = ({ modelName }) => {
    return (
        <span className={`rounded-full py-[2px] px-[5px] font-bold border-none text-${modelName}-200 bg-${modelName}-100 text-xs`}>{modelName}</span>
    );
};

export default ModelChip;