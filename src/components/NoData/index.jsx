import EmptyData from "../../assets/no-data.svg";

const NoData = ({ message = "No data available" }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 mx-auto text-center user-select-none">
            <img draggable="false" src={EmptyData} alt="no data" className="" />
            <h1 className="text-sm text-center text-textColor-200">{message}</h1>
        </div>
    );
};

export default NoData;