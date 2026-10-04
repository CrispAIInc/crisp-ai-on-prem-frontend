import EmptyData from "../../assets/no-data.svg";

const NoData = ({ message = "No data available", classes = "", iconUrl, pulse = false }) => {

    return (
        <div className={`flex flex-col items-center justify-center gap-4 mx-auto text-center user-select-none ${classes}`}>
            <img draggable="false" src={iconUrl || EmptyData} alt="no data" className={`${pulse && 'animate-customPulse'}`} />
            <h1 className={`text-sm text-center text-textColor-200 ${pulse && 'animate-customPulse'}`}>{message}</h1>
        </div>
    );
};

export default NoData;