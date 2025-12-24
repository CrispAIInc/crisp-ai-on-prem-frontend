import { useState, useRef, useEffect, useContext } from "react";
import { MainContext } from '../../contexts/mainContext';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

export default function ActionMenu({ actions }) {
    const {theme} = useContext(MainContext)
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // <div className="relative" ref={ref}>
        <div ref={ref} className={` relative flex flex-col  shadow-lg cursor-pointer rounded-full p-2 hover:bg-white/20 backdrop-blur`} onClick={(e) => {
            e.stopPropagation();
            setOpen((p) => !p)
        }}>
      {/* <button onClick={() => setOpen((p) => !p)}>⋮</button> */}
      <MoreVertOutlinedIcon className="text-textColor-200" /> 

      {open && (
        <div className="absolute left-0 w-40 mt-1 bg-white top-full rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                action.onClick(e);
                setOpen(false);
              }}
              className={`flex items-center w-full gap-2 px-3 py-2 hover:bg-gray-100 hover:rounded-xl ${action.label === 'Delete' ? 'text-red-500' : 'text-textColor-200'}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
