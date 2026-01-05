export default function DropdownItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100
        ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"}
      `}
    >
      {children}
    </button>
  );
}
