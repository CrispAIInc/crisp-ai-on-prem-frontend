export default function Field({ label, children }) {
    return (
        <div className="pt-4 first:pt-4">
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">{label}</label>
            {children}
        </div>
    );
}