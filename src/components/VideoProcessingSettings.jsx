import { useContext, useState } from "react";
import { MainContext } from '../contexts/mainContext';

const PRESETS = [
  { id: "low", label: "Low", description: "1 frame / 5 sec", fps: 1, interval: 5 },
  { id: "medium", label: "Medium", description: "1 frame / 3 sec", fps: 1, interval: 3 },
  { id: "high", label: "High", description: "1 frame / sec", fps: 1, interval: 1 },
  { id: "custom", label: "Custom", description: "Set your own rate", fps: null, interval: null },
];

export default function VideoProcessingSettings({ value, onChange }) {

  const { theme } = useContext(MainContext);

  const [selected, setSelected] = useState(value?.mode ?? "medium");
  const [customFrames, setCustomFrames] = useState(value?.frames ?? 3);
  const [customInterval, setCustomInterval] = useState(value?.interval ?? 1);

  const handleSelect = (id) => {
    setSelected(id);
    const preset = PRESETS.find((p) => p.id === id);
    if (onChange) {
      onChange({
        mode: id,
        frames: id === "custom" ? customFrames : preset.fps,
        interval: id === "custom" ? customInterval : preset.interval,
      });
    }
  };

  const handleCustomChange = (field, val) => {
    if (field === "frames") setCustomFrames(val);
    else setCustomInterval(val);
  };

  const handleCustomBlur = (field, val) => {
    const numVal = Math.min(10, Math.max(1, parseInt(val) || 1));
    if (field === "frames") setCustomFrames(numVal);
    else setCustomInterval(numVal);
    if (onChange && selected === "custom") {
      onChange({
        mode: "custom",
        frames: field === "frames" ? numVal : Math.min(10, Math.max(1, parseInt(customFrames) || 1)),
        interval: field === "interval" ? numVal : Math.min(10, Math.max(1, parseInt(customInterval) || 1)),
      });
    }
  };

  const isCustom = selected === "custom";

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden font-sans">
      {/* Options */}
      <div className="px-3 py-2 space-y-2">
        {PRESETS.map((preset) => {
          const isActive = selected === preset.id;
          const isCustomOption = preset.id === "custom";

          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-150 text-left group ${theme === 'light' ? '!border !border-slate-300' : '!border !border-textColor-200/50'}
                `}
            >
              {/* Radio dot */}
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isActive ? "border-primary-300" : "border-slate-300 group-hover:border-violet-400"}`}
              >
              </span>

              {/* Label */}
              <span className={`flex-1 text-sm font-medium transition-colors
                ${isActive ? "text-primary-300" : theme === 'light' ? "text-slate-700" : "text-textColor-100"}`}>
                {preset.label}
              </span>

              {/* Badge */}
              {!isCustomOption && (
                <span className={`text-xs px-2 py-1 rounded-lg font-mono transition-colors
                  ${isActive
                    ? "bg-violet-200 text-primary-300"
                    : ""
                  }`}>
                  {preset.description}
                </span>
              )}
              {isCustomOption && (
                <span className={`text-xs transition-colors ${isActive ? "text-primary-300" : theme === 'light' ? "text-slate-400" : "text-textColor-400"}`}>
                  {isActive ? "Configuring…" : "Set manually"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom inputs */}
      <div
        className={`px-3 pb-5 transition-all duration-200 ease-in-out
          ${isCustom ? "opacity-100 pointer-events-auto" : "opacity-40 pointer-events-none"}`}
      >
        <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'light' ? '!border !border-slate-300' : '!border !border-textColor-200/50'}`}>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Frames</label>
            <input
              min={1}
              max={10}
              disabled={true}
              value={customFrames}
              // disabled={!isCustom}
              onChange={(e) => handleCustomChange("frames", e.target.value)}
              onBlur={(e) => handleCustomBlur("frames", e.target.value)}
              className={`w-14 text-center text-sm font-mono font-semibold rounded-md px-2 py-1.5
                focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-textColor-100 cursor-not-allowed
               transition-colors ${theme === 'light' ? '!border !border-slate-300' : ' text-white !border !border-textColor-200/50'}`}
            />
          </div>

          <span className="text-slate-500 text-xs font-medium">every</span>

          <div className="flex items-center gap-2">
            <input
              min={1}
              max={10}
              value={customInterval}
              disabled={!isCustom}
              onChange={(e) => handleCustomChange("interval", e.target.value)}
              onBlur={(e) => handleCustomBlur("interval", e.target.value)}
              className={`w-14 text-center text-sm font-mono font-semibold rounded-md px-2 py-1.5
                focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent
               transition-colors ${theme === 'light' ? '!border !border-slate-300' : 'bg-textColor-300 text-white !border !border-textColor-200/50'}`}
            />
            <label className="text-xs text-slate-500 font-medium">second(s)</label>
          </div>
        </div>
        {!isCustom && (
          <p className="text-xs text-slate-400 mt-1.5 text-center">
            Select <span className="font-semibold">Custom</span> to configure manually
          </p>
        )}
      </div>
    </div>
  );
}
