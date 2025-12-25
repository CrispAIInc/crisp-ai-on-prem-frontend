import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from "react";

const generateOptions = (max) =>
  Array.from({ length: max + 1 }, (_, i) =>
    String(i).padStart(2, "0")
  );

const TimeInput = ({ initVal, max, onChange }) => {
  const [value, setValue] = useState(initVal);
  const options = generateOptions(max);
  const [isOpen, setIsOpen] = useState(false);
  const timeOptionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeOptionsRef.current && !timeOptionsRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [timeOptionsRef]);

  const handleTimeClick = (e) => {
    onChange(e.target.innerText);
    setValue(e.target.innerText);
    setIsOpen(false);
  }

  const handleInput = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2);
    if (Number(val) > max) val = String(max);
    setValue(val);
    onChange(val);
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={handleInput}
        onClick={() => setIsOpen(!isOpen)}
        className="py-2 text-xs font-semibold text-center border border-gray-300 rounded-lg w-9 h-7 focus:outline-none focus:border-none focus:ring-2 focus:ring-purple-400"
      />

      <div ref={timeOptionsRef} className={`absolute top-full left-0 w-full h-[100px] overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg ${isOpen ? 'block' : 'hidden'}`}>
        {/* <div className="flex flex-col items-center gap-1 p-2"> */}
          {options.map((opt) => (
            <button
              key={opt}
              onClick={handleTimeClick}
              className="w-full py-2 text-xs text-gray-500 hover:bg-gray-100"
            >
              {opt}
            </button>
          ))}
        {/* </div> */}
      </div>
    </div>
  );
};


export default function TimestampPicker({ start, setStart, end, setEnd, confirmFn, rejectFn }) {

  const toSeconds = (t) =>
    Number(t.h) * 3600 + Number(t.m) * 60 + Number(t.s);

  const validate = () => {
    if (toSeconds(end) <= toSeconds(start)) {
      return false;
    }
    return true;
  };

  function handleConfirm() {
    if (validate()) {
      confirmFn({
        start: `${start.h}:${start.m}:${start.s}`,
        end: `${end.h}:${end.m}:${end.s}`,
      });
    } else {
      rejectFn(true, "End timestamp must be greater than start timestamp.")
    }
  }

  return (
      <div className="flex items-center p-2 bg-white border shadow-xl w-fit rounded-2xl">

      {/* Start */}
      <div className="">
        <div className="flex items-center justify-center gap-2">
          <TimeInput
            initVal={start.h}
            value={start.h}
            max={23}
            onChange={(v) => setStart({ ...start, h: v })}
          />
          :
          <TimeInput
            initVal={start.m}
            value={start.m}
            max={59}
            onChange={(v) => setStart({ ...start, m: v })}
          />
          :
          <TimeInput
            initVal={start.s}
            value={start.s}
            max={59}
            onChange={(v) => setStart({ ...start, s: v })}
          />
        </div>
        </div>
        
        {/* separator */}
        <div className="mx-2 select-none">to</div>

      {/* End */}
      <div className="">
        <div className="flex items-center justify-center gap-2">
          <TimeInput
            initVal={end.h}
            value={end.h}
            max={23}
            onChange={(v) => setEnd({ ...end, h: v })}
          />
          :
          <TimeInput
            initVal={end.m}
            value={end.m}
            max={59}
            onChange={(v) => setEnd({ ...end, m: v })}
          />
          :
          <TimeInput
            initVal={end.s}
            value={end.s}
            max={59}
            onChange={(v) => setEnd({ ...end, s: v })}
          />
        </div>
      </div>

        <div className="flex justify-center gap-2 ml-5">
          <CheckIcon className={'cursor-pointer'} onClick={handleConfirm} />
          <CloseIcon className={'cursor-pointer'} onClick={() => rejectFn(false)} />
        </div>
      </div>
  );
}