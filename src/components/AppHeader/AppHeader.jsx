import appLogo from "../../assets/app-logo.png";
import react from "../../assets/react.svg";

import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

const AppHeader = () => {
  return (
    <div className="border-b border-b-separator">
      <div className="flex items-center justify-between py-2 container-xl ">
        {/* leftside */}
        <div className="flex items-center gap-1">
          <img
            src={appLogo}
            alt="app-logo"
            className="object-fill w-10 h-10 rounded-full"
          />
          <span className="font-bold text-textColor-300">GenBookAI</span>
        </div>

        {/* rightside */}
        <div className="flex items-center gap-1 rounded-md cursor-pointer hover:bg-light-hover-100">
          <img
            src={react}
            alt="app-logo"
            className="object-fill w-10 h-10 rounded-full"
          />
          <span className="text-textColor-200">Harsha</span>
          <KeyboardArrowDownOutlinedIcon />
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
