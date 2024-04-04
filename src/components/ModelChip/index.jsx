const ModelChip = ({ modelName }) => {
    const modelColor = `text-${modelName}-200`;
    const modelBgColor = `bg-${modelName}-100`;

    return (
        <span className={`rounded-full py-[2px] px-[5px] font-bold border-none text-${modelName}-200 bg-${modelName}-100 text-xs`}>{modelName}</span>
    );
};

export default ModelChip;