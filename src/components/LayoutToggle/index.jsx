import WindowOutlinedIcon from '@mui/icons-material/WindowOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';

export default function LayoutToggle({ viewMode = "grid", onChange }) {

    return (
        <div className="flex items-center border rounded-full w-fit">
            <button onClick={() => onChange("grid")}
                className={`flex items-center justify-center rounded-full rounded-r-none p-2 px-3 transition
          ${viewMode === "grid"
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }
        `}
                aria-label="Grid view">
                <WindowOutlinedIcon />
            </button>
            <button onClick={() => onChange("list")}
                className={`flex items-center justify-center rounded-full rounded-l-none p-2 px-3 transition
          ${viewMode === "list"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }
        `}
                aria-label="List view">
                <FormatListBulletedOutlinedIcon />
            </button>
        </div>
    );
}