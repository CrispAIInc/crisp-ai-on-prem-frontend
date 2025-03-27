import React from "react";

const IndentedMenu = ({ menuItems }) => {
    const renderMenu = (items, level = 0) => {
        return items.map((item, index) => (
            <div
                key={index}
                className={`pl-${level * 4} py-2 flex items-center cursor-pointer hover:text-blue-500`}
            >
                {item.icon && <span className="mr-2">{React.createElement(item.icon)}</span>}
                <span>{item.label}</span>
                {item.children && <div>{renderMenu(item.children, level + 1)}</div>}
            </div>
        ));
    };

    return <div className="text-gray-700">{renderMenu(menuItems)}</div>;
};

export default IndentedMenu;
