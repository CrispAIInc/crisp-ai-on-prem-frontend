import { useState, useRef, useEffect, useContext } from "react";
import { MainContext } from '../../contexts/mainContext';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

export default function ActionMenu({ actions }) {
  const { theme } = useContext(MainContext);
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
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
    <div ref={ref} className={`relative flex flex-col cursor-pointer rounded-full hover:bg-white/20`} onClick={(e) => {
      e.stopPropagation();
      setOpen((previousOpen) => {
        if (!previousOpen) {
          const triggerBounds = ref.current?.getBoundingClientRect();
          setAlignRight(Boolean(triggerBounds && triggerBounds.right + 160 <= window.innerWidth));
        }
        return !previousOpen;
      });
    }}>
      <MoreVertOutlinedIcon className="text-primary-300" />

      {open && (
        <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} w-40 z-10 mt-1 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} top-full rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.12)]`}>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                action.onClick(e);
                setOpen(false);
              }}
              className={`flex items-center w-full gap-2 px-3 py-2 ${theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/5 text-textColor-100'} hover:rounded-xl ${action.label === 'Delete' && '!text-red-500'} `}
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
