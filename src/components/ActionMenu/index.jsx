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
        <div ref={ref} className={` relative flex flex-col p-1 rounded-md shadow-lg cursor-pointer`} onClick={(e) => {
            e.stopPropagation();
            setOpen((p) => !p)
        }}>
      {/* <button onClick={() => setOpen((p) => !p)}>⋮</button> */}
      <MoreVertOutlinedIcon className="text-white" /> 

      {open && (
        <div className="absolute left-0 w-40 mt-2 bg-white rounded shadow top-full">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                action.onClick(e);
                setOpen(false);
              }}
              className="flex items-center w-full gap-2 px-3 py-2 hover:bg-gray-100"
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
