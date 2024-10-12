const ModelChip = ({ modelName }) => {
    return (
        <span className={`rounded-full py-[1px] px-[3px] font-bold border-none text-${modelName}-200 bg-${modelName}-100 text-xs`}>{modelName}</span>
    );
};

export default ModelChip;