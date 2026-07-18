import CheckIcon from '@mui/icons-material/Check';
import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../contexts/mainContext";
import LoadingSpinner from "../LoadingSpinner";
import { ProjectContext } from '../../contexts/projectContext';

const generateOptions = (max) =>
  Array.from({ length: max + 1 }, (_, i) =>
    String(i).padStart(2, "0")
  );

const TimeInput = ({ initVal, max, onChange }) => {

  const { theme } = useContext(MainContext);

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
  };

  const handleInput = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    // Allow clearing
    if (val === "") {
      setValue("");
      onChange("");
      return;
    }

    // Max 2 characters
    val = val.slice(0, 2);

    // Clamp to max
    if (Number(val) > max) {
      val = String(max);
    }

    setValue(val);
    onChange(val);
  };

  const handleBlur = () => {
    // If user leaves it empty → default to 00
    if (value === "" || value == null) {
      setValue("00");
      onChange("00");
      return;
    }

    const padded = value.padStart(2, "0");
    setValue(padded);
    onChange(padded);
  };


  return (
    <div className="relative min-w-0">
      <input
        value={value}
        onChange={handleInput}
        onBlur={handleBlur}
        onClick={() => setIsOpen(!isOpen)}
        className={`py-2 text-xs font-semibold text-center rounded-lg w-9 min-w-[2.25rem] h-7 focus:outline-none focus:border-none focus:ring-2 focus:ring-purple-400 ${theme === 'light' ? 'bg-white !border !border-textColor-100/60 text-textColor-200' : 'bg-black/30 text-textColor-100 !border !border-textColor-200/40'}`}
      />

      <div ref={timeOptionsRef} className={`absolute z-[9999] top-full left-0 w-full h-[100px] min-h-[100px] overflow-y-auto rounded-lg shadow-lg ${isOpen ? 'block' : 'hidden'} ${theme === 'light' ? 'bg-white !border text-textColor-200' : 'bg-textColor-300 text-textColor-100 !border !border-textColor-200/40'}`}>
        {/* <div className="flex flex-col items-center gap-1 p-2"> */}
        {options.map((opt) => (
          <button
            key={opt}
            onClick={handleTimeClick}
            className={`w-full py-2 text-xs ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'text-textColor-100 hover:bg-textColor-200/40'}`}
          >
            {opt}
          </button>
        ))}
        {/* </div> */}
      </div>
    </div>
  );
};


export default function TimestampPicker({ isPending, start, setStart, end, setEnd, confirmFn, rejectFn, sourceDuration = 86_399, fromCrispWiz = true }) {

  const { isProjectReadOnly } = useContext(ProjectContext);

  const { theme } = useContext(MainContext);


  const toSeconds = (t) =>
    Number(t.h) * 3600 + Number(t.m) * 60 + Number(t.s);

  const fromSeconds = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  const clampToVideo = (t) => {
    const total = toSeconds(t);
    if (total <= sourceDuration) return t;
    return fromSeconds(sourceDuration);
  };

  useEffect(() => {
    if (!sourceDuration) return;
    setStart((prev) => clampToVideo(prev));
  }, [start.h, start.m, start.s, sourceDuration]);

  useEffect(() => {
    if (!sourceDuration) return;
    setEnd((prev) => clampToVideo(prev));
  }, [end.h, end.m, end.s, sourceDuration]);

  const validate = () => {
    if (toSeconds(end) <= toSeconds(start)) {
      return false;
    }
    return true;
  };

  function handleConfirm() {
    if (isProjectReadOnly) return;

    if (validate()) {
      confirmFn({
        start: `${start.h}:${start.m}:${start.s}`,
        end: `${end.h}:${end.m}:${end.s}`,
      });
    } else {
      rejectFn(true, "Your timestamp range is invalid.");
    }
  }

  return (
    <div
      className={`mt-2 p-3 rounded-2xl select-none
    flex flex-col gap-x-1 gap-y-2
    w-full max-w-full min-w-0 shadow-sm overflow-visible
    sm:flex-row sm:flex-wrap sm:items-center
    ${theme === 'light'
          ? 'bg-white !border'
          : 'bg-black/30 !border-none'}
  `}
    >
      {/* FROM */}
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        <span className={`w-10 shrink-0 text-xs font-medium ${theme === "light" ? "text-textColor-200" : "text-textColor-100"}`}>
          From
        </span>

        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <TimeInput
            initVal={start.h}
            max={Number(fromSeconds(sourceDuration).h)}
            onChange={(v) => setStart({ ...start, h: v })}
          />
          <span className="opacity-50">:</span>
          <TimeInput
            initVal={start.m}
            max={Number(fromSeconds(sourceDuration).m)}
            onChange={(v) => setStart({ ...start, m: v })}
          />
          <span className="opacity-50">:</span>
          <TimeInput
            initVal={start.s}
            max={Number(fromSeconds(sourceDuration).s)}
            onChange={(v) => setStart({ ...start, s: v })}
          />
        </div>
      </div>

      {/* TO */}
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        <span className={`mr-1 shrink-0 text-xs font-medium ${theme === "light" ? "text-textColor-200" : "text-textColor-100"}`}>
          To
        </span>

        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <TimeInput
            initVal={end.h}
            max={Number(fromSeconds(sourceDuration).h)}
            onChange={(v) => setEnd({ ...end, h: v })}
          />
          <span className="opacity-50">:</span>
          <TimeInput
            initVal={end.m}
            max={Number(fromSeconds(sourceDuration).m)}
            onChange={(v) => setEnd({ ...end, m: v })}
          />
          <span className="opacity-50">:</span>
          <TimeInput
            initVal={end.s}
            max={Number(fromSeconds(sourceDuration).s)}
            onChange={(v) => setEnd({ ...end, s: v })}
          />
        </div>
      </div>

      {(!isProjectReadOnly) && (
        <div className="flex shrink-0 justify-end pt-1 sm:ml-auto sm:pt-0">
          {
            isPending ? <LoadingSpinner isSmall cssClasses="ml-2" /> : <CheckIcon
              className={`cursor-pointer hover:scale-105 transition ${theme === "light" ? "text-textColor-200" : "text-textColor-100"}`}
              onClick={handleConfirm}
            />
          }
        </div>
      )
      }
    </div >
  );
}