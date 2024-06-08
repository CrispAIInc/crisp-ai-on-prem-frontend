import { useContext } from 'react';

import { MainContext } from '../../contexts/mainContext';

import appLogo from "../../assets/app-logo.png";
import react from "../../assets/react.svg";

import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

const AppHeader = () => {

  const { theme } = useContext(MainContext);

  return (
    <div className={`border-b border-b-separator bg-background`}>
      <div className="flex items-center justify-between py-2 container-2xl ">
        {/* leftside */}
        <div className="flex items-center gap-1 ml-5">
          <img
            src={appLogo}
            alt="app-logo"
            className="object-fill w-8 h-8 rounded-full"
          />
          <span className={`font-bold text-textColor-300 ${theme === 'dark' && '!text-textColor-100'}`}>GenBookAI</span>
        </div>

        {/* rightside */}
        <div className={`flex items-center gap-1 mr-5 rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}>
          <img
            src={react}
            alt="app-logo"
            className="object-fill w-8 h-8 rounded-full"
          />
          <span className={`text-sm text-textColor-200 ${theme === 'dark' && '!text-textColor-100'}`}>Harsha</span>
          <KeyboardArrowDownOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
