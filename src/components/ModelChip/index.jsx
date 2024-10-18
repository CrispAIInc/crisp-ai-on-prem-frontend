const ModelChip = ({ modelName }) => {
    return (
        <span className={`rounded-full py-[1px] px-[3px] font-bold border-none flex flex-col items-center justify-center text-center w-fit text-${modelName}-200 bg-${modelName}-100 text-[10px] whitespace-nowrap`}>{modelName}</span>
    );
};

export default ModelChip;