export default function VerbositySlider({ value, onChange }) {

    const VERBOSITY_MIN = 30; // seconds
    const VERBOSITY_MAX = 120; // seconds

    function formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return s === 0 ? `${m}m` : `${m}m ${s}s`;
    }

    return (
        <div>
            <input
                type="range"
                min={VERBOSITY_MIN}
                max={VERBOSITY_MAX}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between mt-1.5">
                <span className="text-[11.5px] text-ink-muted">{formatDuration(VERBOSITY_MIN)}</span>
                <span className="text-[11.5px] text-ink-muted">{formatDuration(VERBOSITY_MAX)}</span>
            </div>
        </div>
    );
}